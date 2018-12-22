enum DmFlags {
    NO_FALLING = 8,
    FIXED_FOV = 16,
    NO_FOOTSTEPS = 32,
    INSTANT_WEAPON_CHANGE = 64,
    NO_BUNNY = 128,
    INVIS = 256,
    LIGHT_VOTING = 512,
    NO_SELF_DAMAGE = 1024,
    PLAYER_OVERLAY = 2048
}

enum VideoFlags {
    LOCK_CVARS_BASIC = 1,
    LOCK_CVARS_EXTENDED = 2,
    LOCK_VERTEX = 4
}

// This is used to signal the client that it cannot go to free spectator
enum ElimFlags {
    ONEWAY = 1,
    NO_FREESPEC = 2
}

//Autoparsed from allowedvote
//List: "/map_restart/nextmap/map/g_gametype/kick/clientkick/g_doWarmup/timelimit/fraglimit/custom/shuffle/"
enum VoteFlags {
    map_restart = 1,
    nextmap = 2,
    map = 4,
    g_gametype = 8,
    clientkick = 16,
    g_doWarmup = 32,
    timelimit = 64,
    fraglimit = 128,
    custom = 256,
    shuffle = 512
}

export interface OpenArenaSettings {
    capturelimit?: number;
    // com_blood: 1
    dedicated?: 0 | 1 | 2;
    dmflags?: number;
    elimflags?: number;
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
    elimination_roundtime?: number;
    // elimination_selfdamage: 0
    elimination_shotgun?: number;
    elimination_startArmor?: number;
    elimination_startHealth?: number;
    elimination_warmup?: number;
    fraglimit?: number;
    g_admin?: string;
    g_adminLog?: string;
    g_adminMaxBan?: string;
    // g_adminNameProtect: 1
    // g_adminParseSay: 1
    g_adminTempBan?: string;
    // g_allowVote: 1
    // g_altExcellent: 0
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
    // g_delagHitscan: 0
    // g_doWarmup: 0
    // g_elimination: 0
    // g_enableBreath: 0
    // g_enableDust: 0
    // g_filterBan: 1
    g_floodMaxDemerits?: number;
    g_floodMinTime?: number;
    g_forcerespawn?: number;
    // g_friendlyFire: 0
    // g_gametype: 0
    g_gravity?: number;
    // g_gravityModifier: 1
    // g_humanplayers: 0
    // g_inactivity: 0
    // g_instantgib: 0
    g_knockback?: number;
    // g_lagLightning: 1
    // g_listEntity: 0
    // g_lms_lives: 1
    // g_lms_mode: 0
    g_log?: string;
    // g_logsync: 0
    // g_mappools: 0\\maps_dm.cfg\\1\\maps_tourney.cfg\\3\\maps_tdm.cfg\\4\\maps_ctf.cfg\\5\\maps_oneflag.cfg\\6\\maps_obelisk.cfg\\7\\maps_harvester.cfg\\8\\maps_elimination.cfg\\9\\maps_ctf.cfg\\10\\maps_lms.cfg\\11\\maps_dd.cfg\\12\\maps_dom.cfg\\
    g_maxGameClients?: number;
    g_maxNameChanges?: number;
    g_maxVotes?: number;
    g_maxWarnings?: number;
    g_minNameChangePeriod?: number;
    g_motd?: string;
    g_motdfile?: string;
    // g_music: 
    // g_needpass: 0
    g_obeliskHealth?: number;
    g_obeliskRegenAmount?: number;
    // g_obeliskRegenPeriod: 1
    g_obeliskRespawnDelay?: number;
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
    // g_rockets: 0
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
    // g_timestamp: 0001-01-01 00:00:00
    // g_truePing: 0
    g_vampire_max_health?: number;
    // g_vampire: 0.0
    // g_voteBan: 0
    g_votecustomfile?: string;
    // g_voteGametypes: /0/1/3/4/5/6/7/8/9/10/11/12/
    g_votemapsfile?: string;
    g_voteMaxFraglimit?: number;
    g_voteMaxTimelimit?: number;
    g_voteMinFraglimit?: number;
    g_voteMinTimelimit?: number;
    // g_voteNames: /map_restart/nextmap/map/g_gametype/kick/clientkick/g_doWarmup/timelimit/fraglimit/shuffle/
    g_warmup?: number;
    g_warningExpire?: number;
    g_weaponrespawn?: number;
    g_weaponTeamRespawn?: number;
    // gamedate: __DATE__
    // gamename: GAMEVERSION
    // mapname: nomap
    // nextmap: 
    // pmove_fixed: 1
    // pmove_float: 1
    // pmove_msec: 8
    rconPassword?: string;
    // sv_allowDownload: 0
    sv_banFile?: string;
    // sv_cheats: 1
    sv_dlURL?: string;
    // sv_dorestart: 0
    // sv_flatline: FLATLINE_FOR_MASTER
    // sv_floodProtect: 1
    sv_fps?: number;
    // sv_heartbeat: HEARTBEAT_FOR_MASTER
    sv_hostname?: string;
    // sv_keywords: 
    // sv_killserver: 0
    // sv_lanForceRate: 1
    // sv_lanForceRate: lan
    // sv_mapChecksum: 
    // sv_mapname: 
    // sv_master1..MAX_MASTER_SERVERS
    sv_maxclients?: number; // 0 - 12
    sv_maxPing?: number;
    sv_maxRate?: number;
    sv_minPing?: number;
    sv_minRate?: number;
    // sv_padPackets: 0
    // sv_pakNames: 
    // sv_paks: 
    // sv_privateClients: 0
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
    timelimit?: number;
    videoflags?: number;
    voteflags?: number;


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
