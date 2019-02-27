import { Client as PgClient, QueryResult } from "pg";
import { Game } from "../models/game";
import { ClientOptions } from "../models/client-options";

const BOT_PATTERN = /^BOT\d+$/;
function isBot(clientId: string): boolean {
    return BOT_PATTERN.test(clientId);
}

export class GameDao {
    constructor(private pg: PgClient) {
    }

    public async writeGame(game: Game) {
        try {
            await this.pg.query('BEGIN');

            const startTime = new Date(game.options.timestamp ? Date.parse(game.options.timestamp) : game.startTime);
            const result: QueryResult = await this.pg.query(
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
            }

            for (const join of game.joins) {
                if (isBot(join.clientId)) {
                    continue;
                }
                if (!internIds[join.clientId]) {
                    internIds[join.clientId] = await this.writeClient(join.clientId);
                }

                await this.pg.query(
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

                await this.pg.query(
                    'INSERT INTO award (game_id, time, client_id, type) ' +
                    'VALUES ($1, $2, $3, $4)',
                    [gameId, award.time, toIntern(award.clientId), award.type]
                );
            }

            // write kills
            for (const kill of game.kills) {
                await this.pg.query(
                    'INSERT INTO kill (game_id, time, from_client_id, to_client_id, team_kill, cause) ' +
                    'VALUES ($1, $2, $3, $4, $5, $6)',
                    [gameId, kill.time, toIntern(kill.fromId), toIntern(kill.toId), kill.teamKill, kill.cause]
                );
            }

            // write scores
            for (const clientId in game.score) {
                if (isBot(clientId)) {
                    continue;
                }
                const internId = toIntern(clientId);
                await this.pg.query(
                    'INSERT INTO score (game_id, client_id, score) ' +
                    'VALUES ($1, $2, $3)',
                    [gameId, internId, game.score[clientId]]
                );
            }

            await this.pg.query('COMMIT');
        } catch (e) {
            console.error(`Error writing game ${game.options.timestamp}': ${e}`);
            await this.pg.query('ROLLBACK');
        }
    }

    public async writeClient(clientId: string): Promise<number> {
        let result = await this.pg.query('SELECT id FROM client WHERE hw_id = $1', [clientId]);
        if (result.rows.length === 0) {
            result = await this.pg.query(
                'INSERT INTO client (hw_id) ' +
                'VALUES ($1) RETURNING id',
                [clientId]);
        }
        return result.rows[0].id;
    }
}