import { GameLogParser } from "../log/game-log-parser";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const parser = new GameLogParser();
parser.parse(readFileSync(join(__dirname, '../../logs/server1.log'), 'utf8'));

console.log(`parsed ${parser.getGames().length} games`);
parser.getIgnoredCommands().forEach(c => console.log(c));
