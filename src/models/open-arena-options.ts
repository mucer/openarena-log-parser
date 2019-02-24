import { GameOptions } from "./game-options";

/**
 * Extends the options for open arena wide properties
 */
export interface OpenArenaOptions extends Partial<GameOptions> {
    // com_blood: 1
    dedicated?: 0 | 1 | 2;
    elimination_activewarmup?: number;
    elimination_bfg?: number;
    elimination_chain?: number;
    // elimination_ctf_oneway: 0
    elimination_grapple?: number;
    elimination_grenade?: number;
    elimination_lightning?: number;
    // elimination_lockspectator: 0
    elimination_machinegun?: number;
    elimination_mine?: number;
    elimination_nail?: number;
    elimination_plasmagun?: number;
    elimination_railgun?: number;
    elimination_rocket?: number;
    // elimination_selfdamage: 0
    elimination_shotgun?: number;
    elimination_startArmor?: number;
    elimination_startHealth?: number;
    elimination_warmup?: number;
    g_admin?: string;
    g_adminLog?: string;
    g_adminMaxBan?: string;
    // g_adminNameProtect: 1
    // g_adminParseSay: 1
    g_adminTempBan?: string;
    // g_autonextmap: 0
    // g_awardpushing: 1
    // g_banIPs: 
    g_blueteam?: string;
    // g_blueTeamClientNumbers: 0
    // g_catchup: 0
    g_cubeTimeout?: number;
    // g_damageModifier: 0
    // g_debugAlloc: 0
    // g_debugDamage: 0
    // g_debugMove: 0
    // g_elimination: 0
    // g_filterBan: 1
    g_floodMaxDemerits?: number;
    g_floodMinTime?: number;
    g_forcerespawn?: number;
    // g_friendlyFire: 0
    g_gravity?: number;
    // g_gravityModifier: 1
    // g_humanplayers: 0
    // g_inactivity: 0
    g_knockback?: number;
    // g_lagLightning: 1
    // g_listEntity: 0
    // g_lms_lives: 1
    g_log?: string;
    // g_logsync: 0
    // g_mappools: 0\\maps_dm.cfg\\1\\maps_tourney.cfg\\3\\maps_tdm.cfg\\4\\maps_ctf.cfg\\5\\maps_oneflag.cfg\\
    //             6\\maps_obelisk.cfg\\7\\maps_harvester.cfg\\8\\maps_elimination.cfg\\9\\maps_ctf.cfg\\
    //             10\\maps_lms.cfg\\11\\maps_dd.cfg\\12\\maps_dom.cfg\\
    g_maxNameChanges?: number;
    g_maxVotes?: number;
    g_maxWarnings?: number;
    g_minNameChangePeriod?: number;
    g_motd?: string;
    g_motdfile?: string;
    // g_music: 
    g_obeliskHealth?: number;
    g_obeliskRegenAmount?: number;
    // g_obeliskRegenPeriod: 1
    // g_password: 
    // g_persistantpowerups
    g_podiumDist?: number;
    g_podiumDrop?: number;
    g_proxMineTimeout?: number;
    // g_publicAdminMessages: 1
    g_quadfactor?: number;
    // g_rankings: 0
    g_redteam?: string;
    // g_redTeamClientNumbers: 0
    // g_regen: 0
    // g_respawntime: 0
    // g_restarted: 0
    // g_runes: 0
    // g_runes: 1
    // g_smoothClients: 1
    g_spawnprotect?: number;
    // g_specChat: 1
    g_speed?: number;
    // g_spreeDiv: 5
    g_sprees?: string;
    // g_synchronousClients: 0
    // g_teamAutoJoin: 0
    // g_teamForceBalance: 0
    // g_truePing: 0
    g_vampire_max_health?: number;
    // g_vampire: 0.0
    // g_voteBan: 0
    g_votecustomfile?: string;
    g_votemapsfile?: string;
    // g_voteNames: /map_restart/nextmap/map/g_gametype/kick/clientkick/g_doWarmup/timelimit/fraglimit/shuffle/
    g_warmup?: number;
    g_warningExpire?: number;
    g_weaponrespawn?: number;
    g_weaponTeamRespawn?: number;
    // gamedate: __DATE__
    // nextmap: 
    // pmove_fixed: 1
    // pmove_float: 1
    // pmove_msec: 8
    rconPassword?: string;
    sv_banFile?: string;
    // sv_cheats: 1
    // sv_dorestart: 0
    // sv_flatline: FLATLINE_FOR_MASTER
    sv_fps?: number;
    // sv_heartbeat: HEARTBEAT_FOR_MASTER
    // sv_keywords: 
    // sv_killserver: 0
    // sv_lanForceRate: 1
    // sv_lanForceRate: lan
    // sv_mapChecksum: 
    // sv_mapname: 
    // sv_master1..MAX_MASTER_SERVERS
    // sv_padPackets: 0
    // sv_pakNames: 
    // sv_paks: 
    // sv_privatePassword: 
    // sv_public: 0
    // sv_pure: 1
    // sv_pure: pure
    sv_reconnectlimit?: number;
    // sv_referencedPakNames: 
    // sv_referencedPaks: 
    // sv_serverid: 0
    // sv_showloss: 0
    sv_timeout?: number;
    // sv_voip: 1
    // sv_zombietime: 2
    net_enabled?: number;
    net_ip?: string;
    net_ip6?: string;
    net_port?: number;
    net_port6?: number;
    net_mcast6addr?: string;
    // net_mcast6iface
    // net_mcast6iface
    // net_socksEnabled
    // net_socksServer
    net_socksPort?: number;
    net_socksUsername?: string;
    net_socksPassword?: string;
    // net_dropsim
}
