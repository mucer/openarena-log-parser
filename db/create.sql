CREATE TABLE game (
    id SERIAL PRIMARY KEY,
    map VARCHAR(32) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    type SMALLINT NOT NULL
);

CREATE TABLE person (
    id SERIAL PRIMARY KEY,
    name VARCHAR(32) NOT NULL,
    full_name VARCHAR(128)
);

CREATE TABLE client (
    id SERIAL PRIMARY KEY,
    hw_id CHAR(32) NOT NULL,
    person_id INT
);

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

CREATE TABLE award (
    game_id INT NOT NULL,
    time INT NOT NULL,
    client_id INT NOT NULL,
    type SMALLINT NOT NULL
);

CREATE TABLE score (
    game_id INT NOT NULL,
    client_id INT NOT NULL,
    score SMALLINT NOT NULL
);

CREATE TABLE kill (
    game_id INT NOT NULL,
    time INT NOT NULL,
    from_client_id INT NOT NULL,
    to_client_id INT NOT NULL,
    team_kill BOOLEAN NOT NULL,
    cause SMALLINT NOT NULL
);