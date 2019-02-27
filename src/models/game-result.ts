export interface GameResult {
    time: number;
    reason: string;
    clients: { id: string, name: string, score: number }[];
    red?: number;
    blue?: number;
}
