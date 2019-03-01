import { Pool } from "pg";
import { StatsDao } from "../db/stats-dao";

(async () => {
    const pool = new Pool({
        user: 'postgres',
        host: 'localhost',
        database: 'postgres',
        password: 'test',
        port: 5432
    });

    try {

        // test connection
        console.info('Testing database connection');
        const client = await pool.connect();
        client.release();

        const dao = new StatsDao(pool);
        const clients = await dao.getClients();
        
        console.log(JSON.stringify(clients, undefined, 2));
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
})();
