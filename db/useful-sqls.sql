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
SELECT id, string_agg(num||':'||name , ', ') 
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
) s
ORDER BY 2 DESC;