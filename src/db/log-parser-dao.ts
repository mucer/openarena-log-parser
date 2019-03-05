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
    constructor(private pool: Pool) {
    }

    public async writeGame(game: Game) {
        if (!game.result) {
            throw new Error(`Game '${game.options.timestamp}' has not results set!`);
        }

        let conn: PoolClient = await this.pool.connect();
        try {
            await conn.query('BEGIN');

            const startTime = new Date(game.options.timestamp ? Date.parse(game.options.timestamp) : game.startTime);
            const result: QueryResult = await conn.query(
                'INSERT INTO game (start_time, map, type) ' +
                'VALUES ($1, $2, $3) RETURNING id',
                [startTime, game.options.mapName, game.options.gameType]);
            const gameId: string = result.rows[0].id;

            // write joins
            const internIds: { [hwId: string]: number } = {};
            const toIntern = (hwId: string): number => {
                if (hwId === '<world>') {
                    return 0;
                } else if (isBot(hwId)) {
                    return 1;
                }

                const id = internIds[hwId];
                if (id === undefined) {
                    throw new Error(`no intern ID for hardware ID '${hwId}' found!`);
                }
                return id;
            };

            for (const join of game.joins) {
                if (isBot(join.clientId)) {
                    continue;
                }
                if (!internIds[join.clientId]) {
                    internIds[join.clientId] = await this.writeClient(join.clientId, conn);
                }

                await conn.query(
                    'INSERT INTO game_join (game_id, client_id, from_time, to_time, name, team) ' +
                    'VALUES ($1, $2, $3, $4, $5, $6)',
                    [gameId, toIntern(join.clientId), join.startTime, join.endTime, join.name, join.team]
                );
            }

            // write awards
            for (const award of game.awards) {
                if (isBot(award.clientId)) {
                    continue;
                }

                await conn.query(
                    'INSERT INTO award (game_id, time, client_id, type) ' +
                    'VALUES ($1, $2, $3, $4)',
                    [gameId, award.time, toIntern(award.clientId), award.type]
                );
            }

            // write challenges
            for (const challenge of game.challenges) {
                if (isBot(challenge.clientId)) {
                    continue;
                }

                await conn.query(
                    'INSERT INTO challenge (game_id, time, client_id, type) ' +
                    'VALUES ($1, $2, $3, $4)',
                    [gameId, challenge.time, toIntern(challenge.clientId), challenge.type]
                );
            }

            // write kills
            for (const kill of game.kills) {
                await conn.query(
                    'INSERT INTO kill (game_id, time, from_client_id, to_client_id, team_kill, cause) ' +
                    'VALUES ($1, $2, $3, $4, $5, $6)',
                    [gameId, kill.time, toIntern(kill.fromId), toIntern(kill.toId), kill.teamKill, kill.cause]
                );
            }

            // write scores
            for (const clientId in game.result.score) {
                if (isBot(clientId)) {
                    continue;
                }
                const internId = toIntern(clientId);
                await conn.query(
                    'INSERT INTO score (game_id, client_id, score) ' +
                    'VALUES ($1, $2, $3)',
                    [gameId, internId, game.result.score[clientId]]
                );
            }

            await conn.query('COMMIT');
        } catch (e) {
            console.error(`Error writing game ${game.options.timestamp}': ${e}`);
            await conn.query('ROLLBACK');
        } finally {
            conn.release();
        }
    }

    private async writeClient(clientId: string, conn: PoolClient): Promise<number> {
        let result = await conn.query('SELECT id FROM client WHERE hw_id = $1', [clientId]);
        if (result.rows.length === 0) {
            result = await conn.query(
                'INSERT INTO client (hw_id) ' +
                'VALUES ($1) RETURNING id',
                [clientId]);
        }
        return result.rows[0].id;
    }
}