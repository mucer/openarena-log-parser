import { Team, MeanOfDeath } from "./constants";

export interface Kill {
    time: number;
    fromId: string;
    toId: string;
    teamKill: boolean;
    cause: MeanOfDeath;
}
