import { ClientOptions } from "../models/client-options";
import { AwardType, MeanOfDeath, Team } from "../models/constants";
import { GameOptions } from "../models/game-options";

export interface Kill {
    time: number;
    fromId: string;
    fromTeam: Team;
    toId: string;
    toTeam: Team;
    cause: MeanOfDeath;
}

export interface Award {
    time: number;
    id: string;
    type: AwardType;
}

export interface Result {
    time: number;
    reason: string;
    clients: { id: string, name: string, score: number }[];
    red?: number;
    blue?: number;
}

export class GameStats {
    private clients: (ClientOptions | undefined)[] = [];

    private nextBotId = 0;

    private startTime: number;

    private score: { [clientId: string]: number } = {};

    private kills: Kill[] = [];

    private awards: Award[] = [];

    private result: Result | undefined;

    constructor(public options: GameOptions) {
        this.startTime = new Date().getTime();
    }

    public getStartTime(): number {
        return this.startTime;
    }

    public getClients(): ClientOptions[] {
        return this.clients.filter(Boolean) as ClientOptions[];
    }

    public getClient(pos: number): ClientOptions | undefined {
        return this.clients[pos];
    }

    public updateClient(pos: number, options: ClientOptions): void {
        // merge data
        if (this.clients[pos]) {
            options = Object.assign(this.clients[pos], options);
        }

        // generate id for bots
        if (!options.id) {
            options.id = `BOT${++this.nextBotId}`;
        }

        this.clients[pos] = options;
    }

    public removeClient(pos: number) {
        this.clients[pos] = undefined;
    }

    public getKills(): Kill[] {
        return this.kills;
    }

    public addKill(time: number, fromPos: number, toPos: number, cause: MeanOfDeath) {
        let fromId: string | undefined;
        let fromTeam = -1;
        if (fromPos === 1022) {
            fromId = '<world>';
        } else {
            const from = this.getClient(fromPos);
            if (from) {
                fromId = from ? from.id : undefined;
                fromTeam = from.team;
            }
        }
        const to = this.getClient(toPos);
        if (fromId && to) {
            this.kills.push({
                time,
                fromId,
                fromTeam,
                toId: to.id,
                toTeam: to.team,
                cause
            });
        }
    }

    public getAwards(): Award[] {
        return this.awards;
    }

    public addAward(time: number, pos: number, type: AwardType) {
        const client = this.getClient(pos);
        if (client) {
            this.awards.push({
                time,
                id: client.id,
                type
            });
        }
    }

    public getScore(clientId: string): number | undefined {
        return this.score[clientId];
    }

    public updateScore(pos: number, score: number): void {
        const client = this.getClient(pos);
        if (client) {
            this.score[client.id] = score;
        }
    }

    public getResult(): Result | undefined {
        return this.result;
    }

    public setResult(result: Result): void {
        this.result = result;
    }
}
