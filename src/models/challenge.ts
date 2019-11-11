import { ChallengeType } from "./constants";
import { TeamSize } from "./team-size";

export interface Challenge {
    time: number;
    clientId: string;
    type: ChallengeType;
    teamSize: TeamSize;
}
