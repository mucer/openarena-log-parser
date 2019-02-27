import { AwardType } from "./constants";

export interface Award {
    time: number;
    clientId: string;
    type: AwardType;
}
