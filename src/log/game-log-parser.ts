import { ClientOptions } from "../models/client-options";
import { AwardType, ChallengeType, MeanOfDeath, Team } from "../models/constants";
import { Game } from "../models/game";
import { Join } from "../models/join";
import { ClientOptionsParser } from "./client-option-parser";
import { GameOptionsParser } from "./game-options-parser";

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
                    time = Math.floor((new Date().getTime() - this.current.startTime) / 1000);
                } else {
                    time = 0;
                }
            }

            if (this.current && time) {
                this.current.duration = time;
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
                        this.shutdownGame(time);
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
                    case 'red':
                        this.parseTeamScore(data);
                        break;
                    case 'exit':
                        this.parseResult(time, data);
                        break;
                    case 'ctf':
                        this.parseCtf(time, data);
                        break;
                    case '1fctf':
                        this.parseOneCtf(time, data);
                        break;
                    case 'playerscore':
                        this.parsePlayerScore(data);
                        break;
                    case 'info':
                    case 'clientconnect':
                    case 'clientbegin':
                    case 'playerstore':
                    case 'item': // player picked up an item
                    case 'dom': // events for gametype dominiation
                    case 'dd': // events for gametype double dominiation
                    case 'harvester': // events for gametype harvester
                    case 'obelisk': // events for gametype obelisk
                    case 'say': // chat message to all
                    case 'sayteam': // chat message to team
                    case 'tell': // chat message to other player
                    case 'score': // final player score
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
            score: {},
            points: {},
            startTime: new Date().getTime(),
            duration: 0,
            finished: false
        };
        this.games.push(this.current);
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
            }

            if (this.current.points[client.id] === undefined) {
                this.current.points[client.id] = 0;
            }

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

    private parsePlayerScore(data: string) {
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
                const teamKill = fromId === to.id || to.team !== Team.FREE && fromTeam === to.team;
                // if a bot with skill < 5 is killed the kill is ignored
                if (to.skill !== undefined && to.skill < 5) {
                    return;
                }

                this.current.points[fromId] += teamKill ? -1 : 1;

                this.current.kills.push({
                    time,
                    fromId,
                    toId: to.id,
                    teamKill,
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
            const type = (+match[3] + 100) as AwardType;
            let points: number | undefined;
            switch (type) {
                case AwardType.CTF_GET_FLAG:
                    points = 1;
                    break;
                case AwardType.CTF_FLAG_RETURNED:
                    points = 2;
                    break;
                case AwardType.CTF_CAPTURE_FLAG:
                    points = 3;
                    break;
            }

            this.addAward(time, pos, type, points);
        }
    }

    private parseOneCtf(time: number, data: string) {
        if (this.current) {
            const match = data.match(/(\d+) ([\d-]+) (\d+)/);
            if (!match) {
                throw new Error(`Invalid CTF format given: ${data}`);
            }

            const pos = +match[1];
            const rawType = +match[3];
            let type: number | undefined;
            let points: number | undefined;
            switch (rawType) {
                case 0:
                    points = 1;
                    type = AwardType.CTF_GET_FLAG;
                    break;
                case 1:
                    points = 3;
                    type = AwardType.CTF_CAPTURE_FLAG;
                    break;
                case 3:
                    type = AwardType.CTF_FLAG_CARRIER_FRAGGED;
                    break;
            }

            if (type) {
                this.addAward(time, pos, type, points);
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
                this.addAward(time, pos, type);
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
            const game: Game = this.current;
            game.result = {
                time,
                reason
            };
            game.finished = true;
        }
    }

    private shutdownGame(time: number) {
        if (this.current) {
            this.current.joins.filter(j => !j.endTime).forEach(j => j.endTime = time);
            this.current = undefined;
        }
    }

    private addAward(time: number, clientPos: number, type: AwardType, points?: number) {
        if (this.current) {
            const client = this.current.clients[clientPos];
            if (client) {
                this.current.awards.push({ time, clientId: client.id, type });
                if (points) {
                    this.addPoints(client, points);
                }
            }
        }
    }

    private addPoints(client: ClientOptions, points: number) {
        if (this.current && points) {
            const factor = (client.team === Team.BLUE || client.team === Team.RED) ? this.calcTeamFactor(client.team) : 1;
            this.current.points[client.id] += factor * points;
        }
    }

    private calcTeamFactor(team: number): number {
        if (this.current) {
            let other = 0;
            let total = 0;
            this.current.joins.forEach(j => {
                if (j.team !== team) {
                    other += 1;
                }
                total += 1;
            });
            return (2 * other) / total;
        } else {
            return 1;
        }
    }
}
