import { Team, TeamTask } from "./constants";

export interface ClientOptions {
    id: string;
    // name
    name: string;
    // team
    team: Team;
    model?: string;
    hmodel?: string;
    // color 1
    color1?: number;
    // color 2
    color2?: number;
    // handicap
    handicap?: number;
    // wins
    wins?: number;
    // losses
    losses?: number;
    // bot skill level
    skill?: number;
    // team task
    teamTask?: TeamTask;
    // team leader
    teamLeader?: number;
}
