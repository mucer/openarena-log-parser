import { ClientOptions } from "../models/client-options";
import { AwardType, MeanOfDeath, Team, TEAM_GAME_TYPES, ChallengeType } from "../models/constants";
import { Game } from "../models/game";
import { GameResult } from "../models/game-result";
import { Join } from "../models/join";
import { ClientOptionsParser } from "./client-option-parser";
import { GameOptionsParser } from "./game-options-parser";
import { Award } from "../models/award";

const LOG_TIME_PATTERN = /^\s*(\d+):(\d+) (.*)/;

export class GameLogParser {
    private nextBotId = 0;

    private games: Game[] = [];

    private current: Game | undefined;

    private waiting: ((line: string, time: number) => void)[] = [];

    private clientOptionParser = new ClientOptionsParser();

    private ignoredCommands: string[] = [];

    public parse(...lines: string[]) {
        lines.forEach(line => line && line.split('\n').forEach(l => this.parseLine(l)));
    }

    public getCurrent(): Game | undefined {
        return this.current;
    }

    public getGames(): Game[] {
        return this.games;
    }

    public getIgnoredCommands(): string[] {
        return this.ignoredCommands;
    }

    private parseLine(line: string, time?: number) {
        try {
            if (line.startsWith('--')) {
                return;
            }

            if (time === undefined) {
                const match = LOG_TIME_PATTERN.exec(line);
                if (match) {
                    time = (+match[1] * 60) + (+match[2]);
                    line = match[3];
                } else if (this.current) {
                    time = new Date().getTime() - this.current.startTime;
                } else {
                    time = 0;
                }
            }

            if (this.waiting.length) {
                const fn = this.waiting.shift();
                fn && fn(line, time);
                return;
            }

            const pos = line.indexOf(':');
            if (pos === -1) {
                return;
            }

            const key = line.substr(0, pos);
            const data = line.substr(pos + 1).trim();
            if (/^\w+$/.test(key)) {
                switch (key.toLowerCase()) {
                    case 'initgame':
                        this.initGame(data);
                        break;
                    case 'shutdowngame':
                        this.shutdownGame();
                        break;
                    case 'clientuserinfochanged':
                        this.updateClient(time, data);
                        break;
                    case 'clientdisconnect':
                        this.removeClient(time, data);
                        break;
                    case 'kill':
                        this.addKill(time, data);
                        break;
                    case 'award':
                        this.parseAward(time, data);
                        break;
                    case 'challenge':
                        this.parseChallenge(time, data);
                        break;
                    case 'score':
                        this.parseScore(data);
                        break;
                    case 'red':
                        this.parseTeamScore(data);
                        break;
                    case 'exit':
                        this.parseResult(time, data);
                        break;
                    case 'ctf':
                        this.parseCtf(time, data);
                        break;
                    case 'info':
                    case 'clientconnect':
                    case 'clientbegin':
                    case 'playerstore':
                    case 'item': // player picked up an item
                    case 'dom': // events for gametype dominiation
                    case 'dd': // events for gametype double dominiation
                    case 'harvester': // events for gametype harvester
                    case '1fctf': // events for gametype one capture the flag
                    case 'obelisk': // events for gametype obelisk
                    case 'say': // chat message to all
                    case 'sayteam': // chat message to team
                    case 'tell': // chat message to other player
                    case 'playerscore': // when a player got a point
                    case 'teamscore': // when a team got a point
                    case 'warmup': // no further information
                        break;
                    default:
                        if (!this.ignoredCommands.includes(key)) {
                            this.ignoredCommands.push(key);
                        }
                }
            }
        } catch (e) {
            throw new Error(`Error parsing line '${line}: ${e}`);
        }
    }

    private initGame(data: string) {
        if (this.current) {
            console.warn(
                `Last game not terminated correctly (time=${this.current.options.timestamp}, map=${this.current.options.mapName})`);
        }
        this.current = {
            options: new GameOptionsParser().parse(data),
            clients: [],
            awards: [],
            kills: [],
            joins: [],
            challenges: [],
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

    private parseScore(data: string) {
        if (this.current && this.current.result) {
            const match = data.match(/(\d+)  ping: \d+  client: (\d+)/);
            if (!match) {
                throw new Error(`Invalid score '${data}' given!`);
            }
            const pos = +match[2];
            const score = +match[1];
            const client = this.current.clients[pos];
            if (client) {
                this.current.result.score[client.id] = score;
            }
        }
    }

    private parseTeamScore(data: string) {
        if (this.current && this.current.result) {
            const match = data.match(/(\d+)  blue:(\d+)/);
            if (!match) {
                throw new Error(`Invalid team score '${data}' given!`);
            }
            this.current.result.red = +match[1];
            this.current.result.blue = +match[2];
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

    private parseCtf(time: number, data: string) {
        if (this.current) {
            const match = data.match(/(\d+) (\d+) (\d+)/);
            if (!match) {
                throw new Error(`Invalid CTF format given: ${data}`);
            }
       

            const pos = +match[1];
            const team = +match[2];
            const type = (+match[3] + 100) as AwardType;

            const client = this.current.clients[pos];
            if (client) {
                this.current.awards.push({ time, clientId: client.id, type });
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

    private parseChallenge(time: number, data: string) {
        if (this.current) {
            const match = data.match(/(\d+) (\d+)/);
            if (!match) {
                throw new Error(`Invalid Award format given: ${data}`);
            }

            const pos = +match[1];
            const type = +match[2] as ChallengeType;

            const client = this.current.clients[pos];
            if (client) {
                this.current.challenges.push({ time, clientId: client.id, type });
            }
        }
    }

    private parseResult(time: number, reason: string) {
        if (this.current) {
            const stats: Game = this.current;
            const result: GameResult = stats.result = {
                time,
                reason,
                score: {}
            };
            this.games.push(stats);

            stats.joins.filter(j => !j.endTime).forEach(j => j.endTime = time);
        }
    }

    private shutdownGame() {
        this.current = undefined;
    }
}
