import { GameLogParser } from "../log/game-log-parser";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const parser = new GameLogParser();
parser.parse(readFileSync(join(__dirname, '../logs/server1.log'), 'utf8'));

writeFileSync(
    join(__dirname, '../games.json'),
    JSON.stringify(parser.getGames(), undefined, 2));

console.log('written');