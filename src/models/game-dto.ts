import { GameType } from "./constants";

export interface GameDto {
    id: number;
    map: string;
    type: GameType;
    startTime: Date;
}