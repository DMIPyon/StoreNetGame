"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'netgames',
    password: 'doma1128',
    port: 5433,
});
async function testQuery() {
    try {
        const res = await pool.query(`
      SELECT g.title, d.name as developer, g.price
      FROM games g
      JOIN developers d ON g.developer_id = d.id
      ORDER BY g.title
      LIMIT 10;
    `);
        console.log('Juegos y developers:');
        res.rows.forEach(row => {
            console.log(`- ${row.title} | ${row.developer} | $${row.price}`);
        });
    }
    catch (error) {
        console.error('Error en la consulta:', error);
    }
    finally {
        await pool.end();
    }
}
testQuery();
