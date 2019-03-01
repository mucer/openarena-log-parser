import { Award } from "./award";
import { ClientOptions } from "./client-options";
import { Dictionary } from "./dictionary";
import { GameOptions } from "./game-options";
import { GameResult } from "./game-result";
import { Join } from "./join";
import { Kill } from "./kill";

export interface Game {
    options: GameOptions;

    clients: (ClientOptions | undefined)[];

    startTime: number;

    kills: Kill[];

    awards: Award[];

    joins: Join[];

    result?: GameResult;
}