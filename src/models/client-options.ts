import { Team, TeamTask } from "./constants";

export interface ClientOptions {
    id: string;
    name: string;
    team: Team;
    handicap?: number;
    skill?: number;
}
