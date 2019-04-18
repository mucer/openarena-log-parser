import { Team, TeamTask } from "./constants";

export interface ClientOptions {
    id: string;
    name: string;
    team: Team;
    model?: string;
    hmodel?: string;
    color1?: number;
    color2?: number;
    handicap?: number;
    wins?: number;
    losses?: number;
    skill?: number;
    teamTask?: TeamTask;
    teamLeader?: number;
}
