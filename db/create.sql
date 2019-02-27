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

CREATE TABLE client (
    id SERIAL PRIMARY KEY,
    hw_id CHAR(32) NOT NULL,
    person_id INT
);

CREATE UNIQUE INDEX client_hw_id_idx ON client (hw_id);
CREATE INDEX client_idx ON client (person_id);

INSERT INTO client (id, hw_id) VALUES
    (0, 'WORLD'),
    (1, 'BOT');

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

CREATE TABLE score (
    game_id INT NOT NULL,
    client_id INT NOT NULL,
    score SMALLINT NOT NULL
);

CREATE INDEX score_idx ON score (game_id, client_id);

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
        k.team_kill,
        g.map,
        g.type game_type
    FROM client c1 
    LEFT JOIN person p1 ON p1.id = c1.person_id
    JOIN kill k ON k.from_client_id = c1.id
    JOIN game g ON g.id = k.game_id
    JOIN client c2 ON c2.id = k.to_client_id
    LEFT JOIN person p2 ON p2.id = c2.person_id;
