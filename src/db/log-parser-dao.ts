import { Pool, QueryResult, PoolClient } from "pg";
import { Game } from "../models/game";

const BOT_PATTERN = /^BOT\d+$/;
function isBot(clientId: string): boolean {
  return BOT_PATTERN.test(clientId);
}

/**
 * This class is used to write the result of the log parser into the database
 */
export class LogParserDao {
  constructor(private pool: Pool) {}

  public async writeGame(game: Game) {
    let step = "VALIDATING";
    let conn: PoolClient = await this.pool.connect();
    try {
      if (!game.options.timestamp) {
        throw new Error(`No timestamp given!`);
      }
      if (!game.duration) {
        throw new Error("No duration given!");
      }
      // set end time to duration if no endtime is given
      game.joins
        .filter(j => !j.endTime)
        .forEach(j => (j.endTime = game.duration));

      step = "OPEN CONN";
      await conn.query("BEGIN");

      step = "INSERT GAME";
      const result: QueryResult = await conn.query(
        "INSERT INTO game (start_time, map, type, host_name, duration, finished) " +
          "VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
        [
          new Date(game.options.timestamp),
          game.options.mapName,
          game.options.gameType,
          game.options.svHostname,
          game.duration,
          game.finished
        ]
      );
      const gameId: string = result.rows[0].id;

      // write joins (no intern id will be found, if client only joined as spectator)
      const internIds: { [hwId: string]: number } = {
        "<world>": 1,
        "UNKNOWN": 2,
        "BOT-SKILL-1": 3,
        "BOT-SKILL-2": 4,
        "BOT-SKILL-3": 5,
        "BOT-SKILL-4": 6,
        "BOT-SKILL-5": 7
      };
      const toIntern = (hwId: string): number | undefined => {
        // trim bot number
        if (hwId.startsWith("BOT-SKILL-")) {
          hwId = hwId.substr(0, 11);
        }

        return internIds[hwId];
      };

      step = "INSERT JOINS";
      for (const join of game.joins) {
        let internId = toIntern(join.clientId);
        if (internId === undefined) {
          internId = internIds[join.clientId] = await this.writeClient(
            join.clientId,
            conn
          );
        }

        await conn.query(
          "INSERT INTO game_join (game_id, client_id, from_time, to_time, name, team) " +
            "VALUES ($1, $2, $3, $4, $5, $6)",
          [gameId, internId, join.startTime, join.endTime, join.name, join.team]
        );
      }

      // write awards
      step = "INSERT AWARDS";
      for (const award of game.awards) {
        const internId = toIntern(award.clientId);
        if (internId === undefined) {
          continue;
        }

        await conn.query(
          "INSERT INTO award (game_id, time, client_id, type, team_size_own, team_size_other) " +
            "VALUES ($1, $2, $3, $4, $5, $6)",
          [
            gameId,
            award.time,
            internId,
            award.type,
            award.teamSize.own,
            award.teamSize.other
          ]
        );
      }

      // write challenges
      step = "INSERT CHALLENGES";
      for (const challenge of game.challenges) {
        const internId = toIntern(challenge.clientId);
        if (internId === undefined) {
          continue;
        }

        await conn.query(
          "INSERT INTO challenge (game_id, time, client_id, type, team_size_own, team_size_other) " +
            "VALUES ($1, $2, $3, $4, $5, $6)",
          [
            gameId,
            challenge.time,
            internId,
            challenge.type,
            challenge.teamSize.own,
            challenge.teamSize.other
          ]
        );
      }

      // write kills
      step = "INSERT KILLS";
      for (const kill of game.kills) {
        const internFromId = toIntern(kill.fromId);
        const internToId = toIntern(kill.toId);
        if (internFromId === undefined || internToId === undefined) {
          continue;
        }

        await conn.query(
          `INSERT INTO kill (
                        game_id,
                        time,
                        from_client_id,
                        to_client_id,
                        team_kill,
                        cause,
                        flag_carrier,
                        team_size_own,
                        team_size_other
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            gameId,
            kill.time,
            internFromId,
            internToId,
            kill.teamKill,
            kill.cause,
            kill.flagCarrier,
            kill.teamSize.own,
            kill.teamSize.other
          ]
        );
      }

      step = "COMMIT";
      await conn.query("COMMIT");
    } catch (e) {
      console.error(
        `Error writing game ${game.options.timestamp} (step ${step}): ${e}`
      );
      await conn.query("ROLLBACK");
    } finally {
      conn.release();
    }
  }

  private async writeClient(
    clientId: string,
    conn: PoolClient
  ): Promise<number> {
    let result = await conn.query("SELECT id FROM client WHERE hw_id = $1", [
      clientId
    ]);
    if (result.rows.length === 0) {
      result = await conn.query(
        "INSERT INTO client (hw_id) " + "VALUES ($1) RETURNING id",
        [clientId]
      );
    }
    return result.rows[0].id;
  }
}
