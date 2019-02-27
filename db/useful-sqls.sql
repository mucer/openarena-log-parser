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