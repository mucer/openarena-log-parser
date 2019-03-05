CREATE TABLE game (
    id SERIAL PRIMARY KEY,
    map VARCHAR(32) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    type SMALLINT NOT NULL
);

CREATE INDEX game_idx ON game (map, start_time, type);

CREATE TABLE person (
    id SERIAL PRIMARY KEY,
    name VARCHAR(32) NOT NULL,
    full_name VARCHAR(128)
);

CREATE UNIQUE INDEX person_name_idx ON person (name);

INSERT INTO person (id, name, full_name) VALUES
    (0, 'WORLD', 'The OpenArena world'),
    (1, 'BOT', 'OpenArena Bots');

CREATE TABLE client (
    id SERIAL PRIMARY KEY,
    hw_id CHAR(32) NOT NULL,
    person_id INT
);

CREATE UNIQUE INDEX client_hw_id_idx ON client (hw_id);
CREATE INDEX client_idx ON client (person_id);

INSERT INTO client (id, hw_id, person_id) VALUES
    (0, 'WORLD', 0),
    (1, 'BOT', 1);

CREATE TABLE game_join ( 
    game_id INT NOT NULL,
    client_id INT NOT NULL, 
    from_time INT NOT NULL,
    to_time INT NOT NULL,
    name VARCHAR(32) NOT NULL,
    team SMALLINT NOT NULL
);

CREATE INDEX game_join_idx ON game_join (game_id, client_id);

CREATE TABLE kill (
    game_id INT NOT NULL,
    time INT NOT NULL,
    from_client_id INT NOT NULL,
    to_client_id INT NOT NULL,
    team_kill BOOLEAN NOT NULL,
    cause SMALLINT NOT NULL
);

CREATE INDEX kill_idx ON kill (game_id, from_client_id, to_client_id);

CREATE TABLE award (
    game_id INT NOT NULL,
    time INT NOT NULL,
    client_id INT NOT NULL,
    type SMALLINT NOT NULL
);

CREATE INDEX award_idx ON award (game_id, client_id);

CREATE TABLE award_type (
    id SMALLINT PRIMARY KEY,
    name VARCHAR(32)
);

INSERT INTO award_type (id, name) VALUES
    (0, 'GAUNTLET'),
    (1, 'EXCELLENT'),
    (2, 'IMPRESSIVE'),
    (3, 'DEFENCE'),
    (4, 'CAPTURE'),
    (5, 'ASSIST');

CREATE TABLE challenge (
    game_id INT NOT NULL,
    time INT NOT NULL,
    client_id INT NOT NULL,
    type SMALLINT NOT NULL
);

CREATE INDEX challenge_idx ON challenge (game_id, client_id);

CREATE TABLE challenge_type (
    id SMALLINT PRIMARY KEY,
    name VARCHAR(32)
);

INSERT INTO challenge_type (id, name) VALUES
    (1, 'GENERAL_TOTALKILLS'),
    (2, 'GENERAL_TOTALDEATHS'),
    (3, 'GENERAL_TOTALGAMES'),
    (101, 'GAMETYPES_FFA_WINS'),
    (102, 'GAMETYPES_TOURNEY_WINS'),
    (103, 'GAMETYPES_TDM_WINS'),
    (104, 'GAMETYPES_CTF_WINS'),
    (105, 'GAMETYPES_1FCTF_WINS'),
    (106, 'GAMETYPES_OVERLOAD_WINS'),
    (107, 'GAMETYPES_HARVESTER_WINS'),
    (108, 'GAMETYPES_ELIMINATION_WINS'),
    (109, 'GAMETYPES_CTF_ELIMINATION_WINS'),
    (110, 'GAMETYPES_LMS_WINS'),
    (111, 'GAMETYPES_DD_WINS'),
    (112, 'GAMETYPES_DOM_WINS'),
    (201, 'WEAPON_GAUNTLET_KILLS'),
    (202, 'WEAPON_MACHINEGUN_KILLS'),
    (203, 'WEAPON_SHOTGUN_KILLS'),
    (204, 'WEAPON_GRANADE_KILLS'),
    (205, 'WEAPON_ROCKET_KILLS'),
    (206, 'WEAPON_LIGHTNING_KILLS'),
    (207, 'WEAPON_PLASMA_KILLS'),
    (208, 'WEAPON_RAIL_KILLS'),
    (209, 'WEAPON_BFG_KILLS'),
    (210, 'WEAPON_GRAPPLE_KILLS'),
    (211, 'WEAPON_CHAINGUN_KILLS'),
    (212, 'WEAPON_NAILGUN_KILLS'),
    (213, 'WEAPON_MINE_KILLS'),
    (214, 'WEAPON_PUSH_KILLS'),
    (215, 'WEAPON_INSTANT_RAIL_KILLS'),
    (216, 'WEAPON_TELEFRAG_KILLS'),
    (217, 'WEAPON_CRUSH_KILLS'),
    (301, 'AWARD_IMPRESSIVE'),
    (302, 'AWARD_EXCELLENT'),
    (303, 'AWARD_CAPTURE'),
    (304, 'AWARD_ASSIST'),
    (305, 'AWARD_DEFENCE'),
    (401, 'POWERUP_QUAD_KILL'),
    (402, 'POWERUP_SPEED_KILL'),
    (403, 'POWERUP_FLIGHT_KILL'),
    (404, 'POWERUP_INVIS_KILL'),
    (405, 'POWERUP_MULTI_KILL'),
    (406, 'POWERUP_COUNTER_QUAD'),
    (407, 'POWERUP_COUNTER_SPEED'),
    (408, 'POWERUP_COUNTER_FLIGHT'),
    (409, 'POWERUP_COUNTER_INVIS'),
    (410, 'POWERUP_COUNTER_ENVIR'),
    (411, 'POWERUP_COUNTER_REGEN'),
    (412, 'POWERUP_COUNTER_MULTI'),
    (501, 'FFA_TOP3'),
    (502, 'FFA_FROMBEHIND'),
    (503, 'FFA_BETTERTHAN'),
    (504, 'FFA_JUDGE'),
    (505, 'FFA_CHEAPKILLER');

CREATE TABLE score (
    game_id INT NOT NULL,
    client_id INT NOT NULL,
    score SMALLINT NOT NULL
);

CREATE INDEX score_idx ON score (game_id, client_id);

CREATE TABLE mean_of_death (
    id SMALLINT PRIMARY KEY,
    name VARCHAR(32)
);

INSERT INTO mean_of_death (id, name) VALUES
    (0, 'UNKNOWN'),
    (1, 'SHOTGUN'),
    (2, 'GAUNTLET'),
    (3, 'MACHINEGUN'),
    (4, 'GRENADE'),
    (5, 'GRENADE_SPLASH'),
    (6, 'ROCKET'),
    (7, 'ROCKET_SPLASH'),
    (8, 'PLASMA'),
    (9, 'PLASMA_SPLASH'),
    (10, 'RAILGUN'),
    (11, 'LIGHTNING'),
    (12, 'BFG'),
    (13, 'BFG_SPLASH'),
    (14, 'WATER'),
    (15, 'SLIME'),
    (16, 'LAVA'),
    (17, 'CRUSH'),
    (18, 'TELEFRAG'),
    (19, 'FALLING'),
    (20, 'SUICIDE'),
    (21, 'TARGET_LASER'),
    (22, 'TRIGGER_HURT'),
    (23, 'NAIL'),
    (24, 'CHAINGUN'),
    (25, 'PROXIMITY_MINE'),
    (26, 'KAMIKAZE'),
    (27, 'JUICED'),
    (28, 'GRAPPLE');

CREATE TABLE game_type (
    id SMALLINT PRIMARY KEY,
    name VARCHAR(32),
    description VARCHAR(256)
);

INSERT INTO game_type (id, name, description) VALUES
    (0, 'FFA', 'free for all'),
    (1, 'TOURNAMENT', 'one on one tournament'),
    (2, 'SINGLE_PLAYER', 'single player ffa'),
    (3, 'TEAM', 'team deathmatch'),
    (4, 'CTF', 'capture the flag'),
    (5, 'ONE_FLAG', ''),
    (6, 'OBELISK', ''),
    (7, 'HARVESTER', ''),
    (8, 'ELIMINATION', 'team elimination (custom)'),
    (9, 'CTF_ELIMINATION', 'ctf elimination'),
    (10, 'LMS', 'Last man standing'),
    (11, 'DOUBLE_D', 'Double Domination'),
    (12, 'DOMINATION', 'Standard domination');

CREATE OR REPLACE VIEW kill_ext AS
    SELECT 
        p1.name from_name,
        p1.id from_id,
        k.from_client_id,
        p2.name to_name,
        p2.id to_id,
        k.to_client_id,
        g.start_time,
        k.time game_time,
        k.cause,
        m.name cause_name,
        k.team_kill,
        g.map,
        g.type game_type,
        gt.name game_type_name
    FROM client c1 
    LEFT JOIN person p1 ON p1.id = c1.person_id
    JOIN kill k ON k.from_client_id = c1.id
    JOIN mean_of_death m ON m.id = k.cause
    JOIN game g ON g.id = k.game_id
    JOIN game_type gt ON gt.id = g.type
    JOIN client c2 ON c2.id = k.to_client_id
    LEFT JOIN person p2 ON p2.id = c2.person_id;
