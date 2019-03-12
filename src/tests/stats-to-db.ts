import { readFileSync } from "fs";
import { join } from "path";
import { Client, Pool } from "pg";
import { GameLogParser } from "../log/game-log-parser";
import { LogParserDao } from "../db/log-parser-dao";

const pool = new Pool({
    user: 'postgres',
    host: 'sapp-dev-mon-scrum2',
    database: 'postgres',
    password: 'pwd',
    port: 5432
});

const dao = new LogParserDao(pool);

async function write() {

    const parser = new GameLogParser();
    ['server1-2019-03-05.log', 'server1-2019-03-06.log', 'server1-2019-03-07.log'].forEach(log =>
        parser.parse(readFileSync(join(__dirname, log), 'utf8')));
    const games = parser.getGames();
    for (let i = 0;i < games.length;i++) {
        const game = games[i];
        if (game.kills.every(k => k.fromId === k.toId || k.fromId === 'WORLD')) {
            console.log(`skipping game ${game.options.timestamp} since nothing happened (${i + 1} of ${games.length})`);
        } else {
            console.log(`writing game ${game.options.timestamp} (${i + 1} of ${games.length})`);
            await dao.writeGame(game);
        }
    }

    // refresh materialized views
    const conn = await pool.connect();
    try {
        await conn.query('REFRESH MATERIALIZED VIEW kill_ext');
        await conn.query('REFRESH MATERIALIZED VIEW award_ext');
        await conn.query('REFRESH MATERIALIZED VIEW playtime_week');
    } finally {
        conn.release();
    }
}

write().then(() => pool.end());
