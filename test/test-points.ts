import { readFile } from "fs-extra";
import * as process from 'process';
import { GameLogParser } from '../src/log/game-log-parser';
import { ClientOptions } from '../src/models/client-options';
import { AwardType, GameType } from '../src/models/constants';
import { Game } from '../src/models/game';

(async () => {
    const parser = new GameLogParser();
    const lines = await readFile(__dirname + '/../logs/server1-2019-06-11.log', 'utf8');
    parser.parse(lines);

    parser.getGames()
    .map((g: Game) => '\n' + GameType[g.options.gameType] + g.clients.filter(Boolean).map(c => clientToString(g, c!)))
    .forEach(str => process.stdout.write(str));
})();

function clientToString(game: Game, client: ClientOptions): string {
    return `\n  ${client.id}: `
        + `kills=${game.kills.filter(k => k.fromId === client.id && !k.teamKill).length}, `
        + `points=${game.points[client.id]}, `
        + `awards=${game.awards.filter(a => a.clientId === client.id).map(a => AwardType[a.type])}`;
}