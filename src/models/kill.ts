import { Team, MeanOfDeath } from "./constants";
import { TeamSize } from "./team-size";

export interface Kill {
    time: number;
    fromId: string;
    toId: string;
    teamKill: boolean;
    cause: MeanOfDeath;
    flagCarrier: boolean;
    teamSize: TeamSize;
}
