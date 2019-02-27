import { Team } from "./constants";

export interface Join {
    clientId: string;
    name: string;
    team: Team;
    startTime: number;
    endTime?: number;
}