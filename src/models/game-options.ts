import { GameType } from "./constants";

/**
 * The options send from the server when a new game starts
 */
export class GameOptions {
    public captureLimit: number | undefined;
    public dmFlags = 0;
    public eliminationFlags = 0;
    public eliminationRoundTime: number | undefined;
    public fragLimit: number | undefined;
    public allowVote: number | undefined;
    public altExcellent: number | undefined;
    public delagHitScan: number | undefined;
    public doWarmup: number | undefined;
    public enableBreath: number | undefined;
    public enableDust: number | undefined;
    public gameType: GameType;
    public instantgib: number | undefined;
    public lmsMode: number | undefined;
    public maxGameClients: number | undefined;
    public needPass: number | undefined;
    public obeliskRespawnDelay: number | undefined;
    public rockets: number | undefined;
    public timestamp: string | undefined;
    public voteGameTypes: number[] = [];
    public voteMaxFragLimit: number | undefined;
    public voteMaxTimeLimit: number | undefined;
    public voteMinFragLimit: number | undefined;
    public voteMinTimeLimit: number | undefined;
    public gameName: string | undefined;
    public mapName: string | undefined;
    public protocol: number | undefined;
    public svAllowDownload: number | undefined;
    public svDownloadURL: string | undefined;
    public svFloodProtect: number | undefined;
    public svHostname: string | undefined;
    public svMaxPing: number | undefined;
    public svMaxRate: number | undefined;
    public svMaxClients: number | undefined;
    public svMinPing: number | undefined;
    public svMinRate: number | undefined;
    public svPrivateClients: number | undefined;
    public timelimit: number | undefined;
    public version: string | undefined;
    public videoFlags = 0;
    public voteFlags = 0;

    constructor(data?: string) {
        if (data) {
            this.parse(data);
        }
    }

    public parse(data: string) {
        const ary = data.split('\\');
        if (ary[0] === '') {
            ary.shift();
        }

        for (let i = 0; i < ary.length + 1; i += 2) {
            switch (ary[i]) {
                case 'g_lms_mode':
                    this.lmsMode = +ary[i + 1];
                    break;
                case 'elimination_roundtime':
                    this.eliminationRoundTime = +ary[i + 1];
                    break;
                case 'g_voteMinFraglimit':
                    this.voteMinFragLimit = +ary[i + 1];
                    break;
                case 'g_voteMaxFraglimit':
                    this.voteMaxFragLimit = +ary[i + 1];
                    break;
                case 'g_voteMinTimelimit':
                    this.voteMinTimeLimit = +ary[i + 1];
                    break;
                case 'g_voteMaxTimelimit':
                    this.voteMaxTimeLimit = +ary[i + 1];
                    break;
                case 'g_voteGametypes':
                    this.voteGameTypes = ary[i + 1].split('/').filter(t => t).map(t => + t);
                    break;
                case 'g_doWarmup':
                    this.doWarmup = +ary[i + 1];
                    break;
                case 'videoflags':
                    this.videoFlags = +ary[i + 1];
                    break;
                case 'g_maxGameClients':
                    this.maxGameClients = +ary[i + 1];
                    break;
                case 'capturelimit':
                    this.captureLimit = +ary[i + 1];
                    break;
                case 'g_delaghitscan':
                    this.delagHitScan = +ary[i + 1];
                    break;
                case 'g_allowvote':
                    this.allowVote = +ary[i + 1];
                    break;
                case 'sv_dlURL':
                    this.svDownloadURL = ary[i + 1];
                    break;
                case 'sv_floodProtect':
                    this.svFloodProtect = +ary[i + 1];
                    break;
                case 'sv_maxPing':
                    this.svMaxPing = +ary[i + 1];
                    break;
                case 'sv_minPing':
                    this.svMinPing = +ary[i + 1];
                    break;
                case 'sv_maxRate':
                    this.svMaxRate = +ary[i + 1];
                    break;
                case 'sv_minRate':
                    this.svMinRate = +ary[i + 1];
                    break;
                case 'sv_maxclients':
                    this.svMaxClients = +ary[i + 1];
                    break;
                case 'sv_hostname':
                    this.svHostname = ary[i + 1];
                    break;
                case 'timelimit':
                    this.timelimit = +ary[i + 1];
                    break;
                case 'fraglimit':
                    this.fragLimit = +ary[i + 1];
                    break;
                case 'dmflags':
                    this.dmFlags = +ary[i + 1];
                    break;
                case 'version':
                    this.version = ary[i + 1];
                    break;
                case 'protocol':
                    this.protocol = +ary[i + 1];
                    break;
                case 'g_gametype':
                    this.gameType = + ary[i + 1];
                    break;
                case 'mapname':
                    this.mapName = ary[i + 1];
                    break;
                case 'sv_privateClients':
                    this.svPrivateClients = + ary[i + 1];
                    break;
                case 'sv_allowDownload':
                    this.svAllowDownload = +ary[i + 1];
                    break;
                case 'gamename':
                    this.gameName = ary[i + 1];
                    break;
                case 'elimflags':
                    this.eliminationFlags = + ary[i + 1];
                    break;
                case 'voteflags':
                    this.voteFlags = +ary[i + 1];
                    break;
                case 'g_needpass':
                    this.needPass = +ary[i + 1];
                    break;
                case 'g_obeliskRespawnDelay':
                    this.obeliskRespawnDelay = + ary[i + 1];
                    break;
                case 'g_enableDust':
                    this.enableDust = +ary[i + 1];
                    break;
                case 'g_enableBreath':
                    this.enableBreath = + ary[i + 1];
                    break;
                case 'g_rockets':
                    this.rockets = +ary[i + 1];
                    break;
                case 'g_instantgib':
                    this.instantgib = + ary[i + 1];
                    break;
                case 'g_altExcellent':
                    this.altExcellent = + ary[i + 1];
                    break;
                case 'g_timestamp':
                    this.timestamp = ary[i + 1];
                    break;
            }
        }
    }
}
