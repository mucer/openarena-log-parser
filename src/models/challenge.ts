import { ChallengeType } from "./constants";

export interface Challenge {
    time: number;
    clientId: string;
    type: ChallengeType;
}
