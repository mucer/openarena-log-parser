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