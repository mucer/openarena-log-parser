import { Dictionary } from "./dictionary";

export interface GameResult {
    time: number;
    reason: string;
    score: Dictionary<number>;
    red?: number;
    blue?: number;
}
