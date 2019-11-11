import { AwardType } from "./constants";
import { TeamSize } from "./team-size";

export interface Award {
    time: number;
    clientId: string;
    type: AwardType;
    teamSize: TeamSize;
}
