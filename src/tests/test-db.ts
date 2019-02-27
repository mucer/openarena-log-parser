import { readFileSync } from "fs";
import { join } from "path";
import { Client as PgClient } from "pg";
import { GameDao } from "../db/game-dao";
import { GameLogParser } from "../log/game-log-parser";

const pg = new PgClient({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'test',
    port: 5432
});
pg.connect();

const dao = new GameDao(pg);

dao.getClients().then(clients => {
    console.log(JSON.stringify(clients, undefined, 2));

    pg.end();
});