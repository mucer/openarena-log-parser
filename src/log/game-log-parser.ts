import { ClientOptions } from "../models/client-options";
import { AwardType, MeanOfDeath, Team, TEAM_GAME_TYPES } from "../models/constants";
import { Game } from "../models/game";
import { GameResult } from "../models/game-result";
import { Join } from "../models/join";
import { ClientOptionsParser } from "./client-option-parser";
import { GameOptionsParser } from "./game-options-parser";

const LOG_TIME_PATTERN = /^\s*(\d+):(\d+) (.*)/;

export class GameLogParser {
    private nextBotId = 0;

    private games: Game[] = [];

    private current: Game | undefined;

    private ignoredLines: string[] = [];

    private waiting: ((line: string) => void)[] = [];

    private clientOptionParser = new ClientOptionsParser();

    public parse(...lines: string[]) {
        lines.forEach(line => line && line.split('\n').forEach(l => this.parseLine(l)));
    }

    public getCurrent(): Game | undefined {
        return this.current;
    }

    public getIgnoredLines(): string[] {
        return this.ignoredLines;
    }

    public getGames(): Game[] {
        return this.games;
    }

    private parseLine(line: string) {
        if (line.startsWith('--')) {
            return;
        }

        const match = LOG_TIME_PATTERN.exec(line);
        let time = 0;
        if (match) {
            time = (+match[1] * 60) + (+match[2]);
            line = match[3];
        } else if (this.current) {
            time = new Date().getTime() - this.current.startTime;
        }

        if (this.waiting.length) {
            const fn = this.waiting.shift();
            fn && fn(line);
            return;
        }

        const pos = line.indexOf(':');
        if (pos === -1) {
            this.ignoredLines.push(line);
            return;
        }

        const key = line.substr(0, pos);
        const data = line.substr(pos + 2);
        switch (key) {
            case 'InitGame':
                this.initGame(data);
                break;
            case 'ShutdownGame':
                this.shutdownGame();
                break;
            case 'ClientUserinfoChanged':
                this.updateClient(time, data);
                break;
            case 'ClientDisconnect':
                this.removeClient(time, data);
                break;
            case 'Kill':
                this.addKill(time, data);
                break;
            case 'Award':
                this.parseAward(time, data);
                break;
            case 'PlayerScore':
                this.updatePlayerScore(data);
                break;
            case 'Exit':
                this.parseResult(time, data);
                break;
            case 'CTF':
                this.parseCtf(data);
                break;
            case 'Item':
            case 'broadcast':
            case 'tell':
            case 'sayteam':
            case 'ClientConnect':
            case 'ClientBegin':
            case 'Playerstore':
            case 'Award':
            case 'say':
                break;
            default:
                this.ignoredLines.push(line);
        }
    }

    private initGame(data: string) {
        if (this.current) {
            console.warn('Last game not terminated correctly');
        }
        this.current = {
            options: new GameOptionsParser().parse(data),
            clients: [],
            awards: [],
            kills: [],
            joins: [],
            score: {},
            startTime: new Date().getTime()
        };
    }

    private updateClient(time: number, data: string) {
        if (this.current) {
            const match = data.match(/(\d+) (.*)/);
            if (!match) {
                throw new Error(`Invalid client data string '${data}' given!`);
            }
            const pos = +match[1];
            const client: ClientOptions = this.current.clients[pos] = Object.assign(
                this.current.clients[pos] || {},
                this.clientOptionParser.parse(match[2]));
            // generate id for bots
            if (!client.id) {
                client.id = `BOT${++this.nextBotId}`;
            } else {
                let join: Join | undefined = this.current.joins.find(j => j.clientId === client.id && j.endTime === undefined);
                if (join && (join.name !== client.name || join.team !== client.team)) {
                    join.endTime = time;
                    join = undefined;
                }
                if (!join && client.team !== Team.SPECTATOR) {
                    this.current.joins.push({ clientId: client.id, name: client.name, team: client.team, startTime: time });
                }
            }

        }
    }

    private updatePlayerScore(data: string) {
        if (this.current) {
            const match = data.match(/(\d+) (-?\d+)/);
            if (!match) {
                throw new Error(`Invalid player score '${data}' given!`);
            }
            const pos = +match[1];
            const score = +match[2];
            const client = this.current.clients[pos];
            if (client) {
                this.current.score[client.id] = score;
            }
        }
    }

    private removeClient(time: number, data: string) {
        if (this.current) {
            const client = this.current.clients[+data];
            if (client) {
                this.current.clients[+data] = undefined;
                this.current.joins.filter(j => j.clientId === client.id && j.endTime === undefined).forEach(j => j.endTime = time);
            }
        }
    }

    private addKill(time: number, data: string) {
        if (this.current) {
            const match = data.match(/(\d+) (\d+) (\d+)/);
            if (!match) {
                throw new Error(`Invalid kill format given: ${data}`);
            }

            const fromPos = +match[1];
            const toPos = +match[2];
            const cause: MeanOfDeath = +match[3];


            let fromId: string | undefined;
            let fromTeam = -1;
            if (fromPos === 1022) {
                fromId = '<world>';
            } else {
                const from = this.current.clients[fromPos];
                if (from) {
                    fromId = from ? from.id : undefined;
                    fromTeam = from.team;
                }
            }
            const to = this.current.clients[toPos];
            if (fromId && to) {

                this.current.kills.push({
                    time,
                    fromId,
                    toId: to.id,
                    teamKill: to.team !== Team.FREE && fromTeam === to.team,
                    cause
                });
            }
        }
    }

    private parseCtf(data: string) {
        if (this.current) {
            const match = data.match(/(\d+) (\d+) (\d+)/);
            if (!match) {
                throw new Error(`Invalid CTF format given: ${data}`);
            }

            const clientId = +match[1];
            const team = +match[1];
            const action = +match[1];

            switch (action) {
                case 0:
                    // get flag
                    break;
                case 1:
                    // capture flag
                    break;
                case 2:
                    // flag returned
                    break;
                case 3:
                    // flag carrier fragged
                    break;
            }
        }
    }

    private parseAward(time: number, data: string) {
        if (this.current) {
            const match = data.match(/(\d+) (\d+)/);
            if (!match) {
                throw new Error(`Invalid Award format given: ${data}`);
            }

            const pos = +match[1];
            const type = +match[2] as AwardType;

            const client = this.current.clients[pos];
            if (client) {
                this.current.awards.push({ time, clientId: client.id, type });
            }
        }
    }

    private parseResult(time: number, reason: string) {
        if (this.current) {
            const stats: Game = this.current;
            const result: GameResult = stats.result = {
                time,
                reason,
                clients: []
            };
            this.games.push(stats);
            if (TEAM_GAME_TYPES.includes(+stats.options.gameType)) {
                this.waiting.push(teamResult => {
                    const match = teamResult.match(/red:(\d+)  blue:(\d+)/);
                    if (!match) {
                        throw new Error(`Team result expected, got: ` + teamResult);
                    }
                    result.red = +match[1];
                    result.blue = +match[2];
                });
            }

            stats.joins.filter(j => !j.endTime).forEach(j => j.endTime = time);

            for (let i = 0; i < stats.clients.length; i++) {
                this.waiting.push(line => {
                    const match = line.match(/score: (\d+)  ping: (\d+)  client: (\d+)/);
                    if (match) {
                        const client = stats.clients[+match[3]];
                        if (client) {
                            result.clients.push({ id: client.id, name: client.name, score: +match[1] });
                        }
                    } else {
                        this.parseLine(line);
                    }
                });
            }
        }
    }

    private shutdownGame() {
        this.current = undefined;
    }
}
