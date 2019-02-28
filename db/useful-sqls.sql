select 
 c.hw_id, 
 j.name,
 (select p.name from person p where p.id = c.person_id),
 count(j.name) 
from client c 
join game_join j on c.id = j.client_id 
group by c.hw_id, j.name 
order by c.hw_id;

select s.name, count(s.game_id) from (select distinct p.name, j.game_id from person p join client c on c.person_id = p.id join game_join j on j.client_id = c.id) s
group by s.name
order by s.name;

-- names used by client
SELECT 
    s.id, 
    (select p.name 
     from client c 
     join person p on p.id = c.person_id
     where c.id = s.id),
    string_agg(s.name||'('||s.num||')', ', ') 
FROM (
    SELECT c.id, j.name, count(*) num 
    FROM client c 
    JOIN game_join j ON j.client_id = c.id 
    GROUP BY c.id, j.name 
    ORDER BY 1, 3 DESC
) s 
GROUP by id;

-- kill stats per person
SELECT
    name,
    kills * 1.0 / deaths kill_death_ratio,
    kills,
    team_kills,
    team_kills * 1.0 / kills team_kill_ratio,
    deaths
FROM (
    SELECT
        p.name,
        (SELECT count(*) FROM kill_ext k WHERE k.from_id = p.id AND k.team_kill = false) kills,
        (SELECT count(*) FROM kill_ext k WHERE k.from_id = p.id AND k.team_kill = true) team_kills,
        (SELECT count(*) FROM kill_ext k WHERE k.to_id = p.id) deaths
    FROM
        person p
    WHERE
        start_time between '2019-02-27 00:00:00' and '2019-02-27 23:59:59'
) s
ORDER BY 2 DESC;

-- kills for day
SELECT from_name, count(*)
FROM kill_ext 
WHERE start_time between '2019-02-27 00:00:00' AND '2019-02-27 23:59:59'
GROUP BY FROM NAME;

-- played time for day
SELECT p.name, sum(gj.to_time - gj.from_time)
FROM game g
JOIN game_join gj ON gj.game_id = g.id
JOIN client c ON c.id = gj.client_id
JOIN person p ON p.id = c.person_id
WHERE g.start_time between '2019-02-27 00:00:00' and '2019-02-27 23:59:59'
GROUP BY p.name
ORDER BY 2 DESC;

-- stats for day
WITH 
  play_time AS (
    SELECT 
      p.name person_name,
      p.id person_id,
      sum(gj.to_time - gj.from_time) seconds
    FROM game g
    JOIN game_join gj ON gj.game_id = g.id
    JOIN client c ON c.id = gj.client_id
    JOIN person p ON p.id = c.person_id
    WHERE g.start_time between '2019-02-27 00:00:00' and '2019-02-27 23:59:59'
    GROUP BY p.name, p.id
  ),
  kills AS (
    SELECT *
    FROM kill_ext 
    WHERE start_time between '2019-02-27 00:00:00' AND '2019-02-27 23:59:59'
  )
SELECT
  s.*,
  round(s.kills * 1.0 / s.deaths, 2) kill_death_ratio,
  round(s.kills * 60.0 / s.seconds, 2) kills_per_minute,
  round(s.team_kills * 100.0 / s.kills, 1)||'%' team_kill_ratio
FROM (
  SELECT
    t.person_name,
    t.seconds,
    (select count(*) from kills k where k.from_id = t.person_id and k.team_kill = false) kills,
    (select count(*) from kills k where k.from_id = t.person_id and k.team_kill = false and k.cause = 10) rail_kills,
    (select count(*) from kills k where k.from_id = t.person_id and k.team_kill = true) team_kills,
    (select count(*) from kills k where k.to_id = t.person_id) deaths
  FROM play_time t
) s
ORDER BY kill_death_ratio DESC;
