import { readFileSync } from "fs";
import { join } from "path";
import { Client } from "pg";
import { GameDao } from "../db/game-dao";
import { GameLogParser } from "../log/game-log-parser";

const client = new Client({
    user: 'postgres',
    host: 'sapp-dev-mon-scrum2',
    database: 'postgres',
    password: 'pwd',
    port: 5432
});
client.connect();

const dao = new GameDao(client);

async function write() {

    const parser = new GameLogParser();
    parser.parse(readFileSync(join(__dirname, './server1.log'), 'utf8'));
    const games = parser.getGames();
    for (let i = 0; i < games.length; i++) {
        const game = games[i];
        if (game.kills.every(k => k.fromId === k.toId || k.fromId === 'WORLD')) {
            console.log(`skipping game ${game.options.timestamp} since nothing happened (${i + 1} of ${games.length})`);
        } else {
            console.log(`writing game ${game.options.timestamp} (${i + 1} of ${games.length})`);
            // await dao.writeGame(game);
        }
    }
}

write().then(() => client.end());
