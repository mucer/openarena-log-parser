import { readFile } from "fs-extra";
import * as glob from 'glob';
import { Pool } from "pg";
import { argv, stdout } from "process";
import { LogParserDao } from "../db/log-parser-dao";
import { GameLogParser } from "../log/game-log-parser";


class UsageError extends Error {
    constructor(error?: string) {
        let msg = 'USAGE: stats-to-db USER/PASSWORD@HOST[:PORT]/DB FILES';
        if (error) {
            msg += `\n${error}`;
        }
        super(msg);
    }
}

function listFiles(pattern: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
        glob(pattern, (err: Error | null, files: string[]) => {
            if (err) {
                reject(err);
            } else {
                resolve(files.sort());
            }
        });
    });
}

async function execute() {
    const args = argv.slice(2);
    if (args.length !== 2) {
        throw new UsageError('2 parameters expected');
    }
    const [dbStr, fileStr] = args;

    const dbAry = /(.*)\/(.*)@(.*)\/(.*)/.exec(dbStr);
    if (!dbAry) {
        throw new UsageError('Invalid DB string given');
    }
    const [user, password, hostStr, database] = dbAry.slice(1);
    const [host, port] = hostStr.includes(':') ? hostStr.split(':') : [hostStr, '5432'];
    const pool = new Pool({ user, host, database, password, port: +port });

    stdout.write('testing database connection: ');
    const testConn = await pool.connect();
    testConn.release();
    stdout.write('OK\n');

    stdout.write('listing files: ');
    const files = await listFiles(fileStr);
    stdout.write(`found ${files.length} file(s)\n`);

    const dao = new LogParserDao(pool);
    const parser = new GameLogParser();

    for (let file of files) {
        stdout.write(`reading file ${file}\n`);
        parser.parse(await readFile(file, 'utf8'));
    }
    const games = parser.getGames();
    stdout.write(`found ${games.length} game(s)\n`);

    for (let i = 0; i < games.length; i++) {
        const game = games[i];
        if (game.kills.every(k => k.fromId === k.toId || k.fromId === 'WORLD')) {
            stdout.write(`skipping game ${game.options.timestamp} (${i + 1} of ${games.length}): no kills found\n`);
        } else if (game.duration < 60) {
            stdout.write(`skipping game ${game.options.timestamp} (${i + 1} of ${games.length}): only lasted ${game.duration} seconds\n`);
        } else {
            stdout.write(`writing game ${game.options.timestamp} (${i + 1} of ${games.length})\n`);
            await dao.writeGame(game);
        }
    }

    // refreshing materialized views
    stdout.write('refreshing materialized views\n');
    const conn = await pool.connect();
    try {
        await conn.query('REFRESH MATERIALIZED VIEW kill_ext');
        await conn.query('REFRESH MATERIALIZED VIEW award_ext');
        await conn.query('REFRESH MATERIALIZED VIEW playtime_week');
    } finally {
        conn.release();
    }

    await pool.end();
}

execute().then(
    () => stdout.write('DONE\n'),
    err => stdout.write(`ERROR: ${err}\n`));
