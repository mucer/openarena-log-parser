export enum DmFlags {
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

export enum TeamTask {
    TEAMTASK_NONE,
    TEAMTASK_OFFENSE,
    TEAMTASK_DEFENSE,
    TEAMTASK_PATROL,
    TEAMTASK_FOLLOW,
    TEAMTASK_RETRIEVE,
    TEAMTASK_ESCORT,
    TEAMTASK_CAMP
}

export enum AwardType {
    GAUNTLET,
    EXCELLENT,
    IMPRESSIVE,
    DEFENCE,
    CAPTURE,
    ASSIST
}

export enum VideoFlags {
    LOCK_CVARS_BASIC = 1,
    LOCK_CVARS_EXTENDED = 2,
    LOCK_VERTEX = 4
}

// This is used to signal the client that it cannot go to free spectator
export enum ElimFlags {
    ONEWAY = 1,
    NO_FREESPEC = 2
}

// Autoparsed from allowedvote
// List: "/map_restart/nextmap/map/g_gametype/kick/clientkick/g_doWarmup/timelimit/fraglimit/custom/shuffle/"
export enum VoteFlags {
    MAP_RESTART = 1,
    NEXTMAP = 2,
    MAP = 4,
    G_GAMETYPE = 8,
    CLIENTKICK = 16,
    G_DOWARMUP = 32,
    TIMELIMIT = 64,
    FRAGLIMIT = 128,
    CUSTOM = 256,
    SHUFFLE = 512
}

export enum Team {
    FREE,
    RED,
    BLUE,
    SPECTATOR
}

export enum MeanOfDeath {
    UNKNOWN,
    SHOTGUN,
    GAUNTLET,
    MACHINEGUN,
    GRENADE,
    GRENADE_SPLASH,
    ROCKET,
    ROCKET_SPLASH,
    PLASMA,
    PLASMA_SPLASH,
    RAILGUN,
    LIGHTNING,
    BFG,
    BFG_SPLASH,
    WATER,
    SLIME,
    LAVA,
    CRUSH,
    TELEFRAG,
    FALLING,
    SUICIDE,
    TARGET_LASER,
    TRIGGER_HURT,
    NAIL,
    CHAINGUN,
    PROXIMITY_MINE,
    KAMIKAZE,
    JUICED,
    GRAPPLE
}

export enum GameType {
    FFA,             // free for all
    TOURNAMENT,      // one on one tournament
    SINGLE_PLAYER,   // single player ffa
    TEAM,            // team deathmatch
    CTF,             // capture the flag
    ONE_FLAG,
    OBELISK,
    HARVESTER,
    ELIMINATION,     // team elimination (custom)
    CTF_ELIMINATION, // ctf elimination
    LMS,             // Last man standing
    DOUBLE_D,        // Double Domination
    DOMINATION,      // Standard domination
    MAX_GAME_TYPE
}

export enum Challenge {
    GENERAL_TOTALKILLS = 1,
    GENERAL_TOTALDEATHS = 2,
    GENERAL_TOTALGAMES = 3,

    // gametypes
    GAMETYPES_FFA_WINS = 101,
    GAMETYPES_TOURNEY_WINS = 102,
    GAMETYPES_TDM_WINS = 103,
    GAMETYPES_CTF_WINS = 104,
    GAMETYPES_1FCTF_WINS = 105,
    GAMETYPES_OVERLOAD_WINS = 106,
    GAMETYPES_HARVESTER_WINS = 107,
    GAMETYPES_ELIMINATION_WINS = 108,
    GAMETYPES_CTF_ELIMINATION_WINS = 109,
    GAMETYPES_LMS_WINS = 110,
    GAMETYPES_DD_WINS = 111,
    GAMETYPES_DOM_WINS = 112,

    // weapons
    WEAPON_GAUNTLET_KILLS = 201,
    WEAPON_MACHINEGUN_KILLS = 202,
    WEAPON_SHOTGUN_KILLS = 203,
    WEAPON_GRANADE_KILLS = 204,
    WEAPON_ROCKET_KILLS = 205,
    WEAPON_LIGHTNING_KILLS = 206,
    WEAPON_PLASMA_KILLS = 207,
    WEAPON_RAIL_KILLS = 208,
    WEAPON_BFG_KILLS = 209,
    WEAPON_GRAPPLE_KILLS = 210,
    WEAPON_CHAINGUN_KILLS = 211,
    WEAPON_NAILGUN_KILLS = 212,
    WEAPON_MINE_KILLS = 213,
    WEAPON_PUSH_KILLS = 214,
    WEAPON_INSTANT_RAIL_KILLS = 215,
    WEAPON_TELEFRAG_KILLS = 216,
    WEAPON_CRUSH_KILLS = 217,

    // awards
    // gauntlet is not here as it is the same as WEAPON_GAUNTLET_KILLS
    AWARD_IMPRESSIVE = 301,
    AWARD_EXCELLENT = 302,
    AWARD_CAPTURE = 303,
    AWARD_ASSIST = 304,
    AWARD_DEFENCE = 305,

    // powerups
    POWERUP_QUAD_KILL = 401,
    POWERUP_SPEED_KILL = 402,
    POWERUP_FLIGHT_KILL = 403,
    POWERUP_INVIS_KILL = 404,
    POWERUP_MULTI_KILL = 405,
    POWERUP_COUNTER_QUAD = 406,
    POWERUP_COUNTER_SPEED = 407,
    POWERUP_COUNTER_FLIGHT = 408,
    POWERUP_COUNTER_INVIS = 409,
    POWERUP_COUNTER_ENVIR = 410,
    POWERUP_COUNTER_REGEN = 411,
    POWERUP_COUNTER_MULTI = 412,

    // FFA awards
    FFA_TOP3 = 501,
    // enemy gets fraglimit-1, player has at most fraglimit-2 but wins anyway
    FFA_FROMBEHIND = 502,
    // loose a match but have a positive kill ratio against the winner
    FFA_BETTERTHAN = 503,
    // get at least half of your kills for players in the best half of the scoreboard
    FFA_JUDGE = 504,
    // the oppesite
    FFA_CHEAPKILLER = 505
}

export const TEAM_GAME_TYPES: GameType[] = [
    GameType.TEAM,
    GameType.CTF,
    GameType.ONE_FLAG,
    GameType.OBELISK,
    GameType.HARVESTER,
    GameType.ELIMINATION,
    GameType.CTF_ELIMINATION,
    GameType.DOUBLE_D,
    GameType.DOMINATION
];