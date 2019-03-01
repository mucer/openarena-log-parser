import { PoolClient, Pool } from "pg";
import { GameDto } from "../models/game-dto";
import { PersonDto } from "../models/person-dto";
import { ClientDto } from "../models/client-dto";

export class StatsDao {
    constructor(private pool: Pool) {
    }

    public async getGames(): Promise<GameDto[]> {
        const result = await this.pool.query('SELECT id, map, type, start_time FROM game');

        return result.rows.map(r => ({
            id: r.id,
            map: r.map,
            type: r.type,
            startTime: r.start_time
        }));
    }

    public async getPersons(): Promise<PersonDto[]> {
        const result = await this.pool.query('SELECT id, name, full_name FROM person');

        return result.rows.map(r => ({
            id: r.id,
            name: r.name,
            fullName: r.full_name
        }));
    }

    public async getClients(): Promise<ClientDto[]> {
        const conn: PoolClient = await this.pool.connect();
        try {
            const result = await conn.query(
                'SELECT c.id, c.hw_id, c.person_id, (SELECT p.name FROM person p WHERE p.id = c.person_id) as person_name FROM client c');
            const clients: ClientDto[] = [];
            for (const row of result.rows) {
                const id: number = row.id;

                const namesResult = await conn.query(
                    'SELECT name, count(*) num FROM game_join WHERE client_id = $1 GROUP BY name ORDER BY 2 DESC',
                    [id]);

                clients.push({
                    id,
                    hwId: row.hw_id,
                    personId: row.person_id,
                    personName: row.person_name,
                    names: namesResult.rows.map(r => ({
                        name: r.name,
                        count: r.num
                    }))
                });
            }
            return clients;
        } finally {
            conn.release();
        }

    }
}