import { ClientOptions } from "../models/client-options";
import { MeanOfDeath, TEAM_GAME_TYPES, Team } from "../models/constants";
import { GameOptions } from "../models/game-options";
import { GameStats, Result } from "./game-stats";

const LOG_TIME_PATTERN = /^\s*(\d+):(\d+) (.*)/;

export class GameLogParser {
    private games: GameStats[] = [];

    private current: GameStats | undefined;

    private ignoredLines: string[] = [];

    private waiting: ((line: string) => void)[] = [];

    public parse(...lines: string[]) {
        lines.forEach(line => line && line.split('\n').forEach(l => this.parseLine(l)));
    }

    public getCurrent(): GameStats | undefined {
        return this.current;
    }

    public getIgnoredLines(): string[] {
        return this.ignoredLines;
    }

    public getGames(): GameStats[] {
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
            time = new Date().getTime() - this.current.getStartTime();
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
                this.updateClient(data);
                break;
            case 'ClientDisconnect':
                this.removeClient(data);
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
        this.current = new GameStats(new GameOptions(data));

        // console.log(`New game: startTime=${this.startTime}, map=${this.options.mapname}, type=${GameType[this.options.g_gametype]}`);
    }

    private updateClient(data: string) {
        if (this.current) {
            const match = data.match(/(\d+) (.*)/);
            if (!match) {
                throw new Error(`Invalid client data string '${data}' given!`);
            }
            const pos = +match[1];
            const options = new ClientOptions(match[2]);
            this.current.updateClient(pos, options);
            // console.log(`client: id=${id}, name=${options.n}, team=${Team[options.t]}`);
        }
    }

    private updatePlayerScore(data: string) {
        if (this.current) {
            const match = data.match(/(\d+) (-?\d+)/);
            if (!match) {
                throw new Error(`Invalid player score '${data}' given!`);
            }
            const id = +match[1];
            const score = +match[2];
            this.current.updateScore(id, score);
            // console.log(`score: pos=${pos}, id=${this.clients[pos].id} name=${this.clients[pos].n}, score=${score}`);
        }
    }

    private removeClient(data: string) {
        if (this.current) {
            this.current.removeClient(+data);
        }
    }

    private addKill(time: number, data: string) {
        if (this.current) {
            console.log(data);
            const match = data.match(/(\d+) (\d+) (\d+)/);
            if (!match) {
                throw new Error(`Invalid kill format given: ${data}`);
            }

            const from = +match[1];
            const to = +match[2];
            const cause: MeanOfDeath = +match[3];
            this.current.addKill(time, from, to, cause);
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
            const award = +match[2];
            this.current.addAward(time, pos, award);
        }
    }

    private parseResult(time: number, reason: string) {
        if (this.current) {
            const stats: GameStats = this.current;
            const result: Result = {
                time,
                reason,
                clients: []
            };
            stats.setResult(result);
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

            for (let i = 0; i < this.current.getClients().length; i++) {
                this.waiting.push(line => {
                    const match = line.match(/score: (\d+)  ping: (\d+)  client: (\d+)/);
                    if (match) {
                        const client = stats.getClient(+match[3]);
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
