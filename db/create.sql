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
