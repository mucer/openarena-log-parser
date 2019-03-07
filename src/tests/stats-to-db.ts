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
    parser.parse(readFileSync(join(__dirname, './server1.log'), 'utf8'));
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
    } finally {
        conn.release();
    }
}

write().then(() => pool.end());
