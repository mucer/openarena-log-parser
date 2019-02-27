import { GameType } from "./constants";

/**
 * The options send from the server when a new game starts
 */
export interface GameOptions {
    captureLimit?: number;
    dmFlags?: number;
    eliminationFlags?: number;
    eliminationRoundTime?: number;
    fragLimit?: number;
    allowVote?: number;
    altExcellent?: number;
    delagHitScan?: number;
    doWarmup?: number;
    enableBreath?: number;
    enableDust?: number;
    gameType: GameType;
    instantgib?: number;
    lmsMode?: number;
    maxGameClients?: number;
    needPass?: number;
    obeliskRespawnDelay?: number;
    rockets?: number;
    timestamp?: string;
    voteGameTypes?: number[];
    voteMaxFragLimit?: number;
    voteMaxTimeLimit?: number;
    voteMinFragLimit?: number;
    voteMinTimeLimit?: number;
    gameName?: string;
    mapName?: string;
    protocol?: number;
    svAllowDownload?: number;
    svDownloadURL?: string;
    svFloodProtect?: number;
    svHostname?: string;
    svMaxPing?: number;
    svMaxRate?: number;
    svMaxClients?: number;
    svMinPing?: number;
    svMinRate?: number;
    svPrivateClients?: number;
    timelimit?: number;
    version?: string;
    videoFlags?: number;
    voteFlags?: number;
}