import { GameOptions } from "../models/game-options";
import { GameType } from "../models/constants";

/**
 * The options send from the server when a new game starts
 */
export class GameOptionsParser {
    public parse(data: string): GameOptions {
        const options: GameOptions = {
            gameType: GameType.FFA
        };
        const ary = data.split('\\');
        if (ary[0] === '') {
            ary.shift();
        }

        for (let i = 0; i < ary.length + 1; i += 2) {
            switch (ary[i]) {
                case 'g_lms_mode':
                    options.lmsMode = +ary[i + 1];
                    break;
                case 'elimination_roundtime':
                    options.eliminationRoundTime = +ary[i + 1];
                    break;
                case 'g_voteMinFraglimit':
                    options.voteMinFragLimit = +ary[i + 1];
                    break;
                case 'g_voteMaxFraglimit':
                    options.voteMaxFragLimit = +ary[i + 1];
                    break;
                case 'g_voteMinTimelimit':
                    options.voteMinTimeLimit = +ary[i + 1];
                    break;
                case 'g_voteMaxTimelimit':
                    options.voteMaxTimeLimit = +ary[i + 1];
                    break;
                case 'g_voteGametypes':
                    options.voteGameTypes = ary[i + 1].split('/').filter(t => t).map(t => + t);
                    break;
                case 'g_doWarmup':
                    options.doWarmup = +ary[i + 1];
                    break;
                case 'videoflags':
                    options.videoFlags = +ary[i + 1];
                    break;
                case 'g_maxGameClients':
                    options.maxGameClients = +ary[i + 1];
                    break;
                case 'capturelimit':
                    options.captureLimit = +ary[i + 1];
                    break;
                case 'g_delaghitscan':
                    options.delagHitScan = +ary[i + 1];
                    break;
                case 'g_allowvote':
                    options.allowVote = +ary[i + 1];
                    break;
                case 'sv_dlURL':
                    options.svDownloadURL = ary[i + 1];
                    break;
                case 'sv_floodProtect':
                    options.svFloodProtect = +ary[i + 1];
                    break;
                case 'sv_maxPing':
                    options.svMaxPing = +ary[i + 1];
                    break;
                case 'sv_minPing':
                    options.svMinPing = +ary[i + 1];
                    break;
                case 'sv_maxRate':
                    options.svMaxRate = +ary[i + 1];
                    break;
                case 'sv_minRate':
                    options.svMinRate = +ary[i + 1];
                    break;
                case 'sv_maxclients':
                    options.svMaxClients = +ary[i + 1];
                    break;
                case 'sv_hostname':
                    options.svHostname = ary[i + 1];
                    break;
                case 'timelimit':
                    options.timelimit = +ary[i + 1];
                    break;
                case 'fraglimit':
                    options.fragLimit = +ary[i + 1];
                    break;
                case 'dmflags':
                    options.dmFlags = +ary[i + 1];
                    break;
                case 'version':
                    options.version = ary[i + 1];
                    break;
                case 'protocol':
                    options.protocol = +ary[i + 1];
                    break;
                case 'g_gametype':
                    options.gameType = + ary[i + 1];
                    break;
                case 'mapname':
                    options.mapName = ary[i + 1];
                    break;
                case 'sv_privateClients':
                    options.svPrivateClients = + ary[i + 1];
                    break;
                case 'sv_allowDownload':
                    options.svAllowDownload = +ary[i + 1];
                    break;
                case 'gamename':
                    options.gameName = ary[i + 1];
                    break;
                case 'elimflags':
                    options.eliminationFlags = + ary[i + 1];
                    break;
                case 'voteflags':
                    options.voteFlags = +ary[i + 1];
                    break;
                case 'g_needpass':
                    options.needPass = +ary[i + 1];
                    break;
                case 'g_obeliskRespawnDelay':
                    options.obeliskRespawnDelay = + ary[i + 1];
                    break;
                case 'g_enableDust':
                    options.enableDust = +ary[i + 1];
                    break;
                case 'g_enableBreath':
                    options.enableBreath = + ary[i + 1];
                    break;
                case 'g_rockets':
                    options.rockets = +ary[i + 1];
                    break;
                case 'g_instantgib':
                    options.instantgib = + ary[i + 1];
                    break;
                case 'g_altExcellent':
                    options.altExcellent = + ary[i + 1];
                    break;
                case 'g_timestamp':
                    options.timestamp = ary[i + 1];
                    break;
            }
        }
        return options;
    }
}
