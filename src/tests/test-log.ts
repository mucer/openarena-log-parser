import { GameLogParser } from "../log/game-log-parser";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const parser = new GameLogParser();
parser.parse(readFileSync(join(__dirname, '../../logs/single-game.log'), 'utf8'));

console.log(parser.getGames()[0]);

console.log('done')
