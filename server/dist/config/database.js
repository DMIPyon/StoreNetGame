"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const pg_1 = require("pg");
exports.pool = new pg_1.Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres', // Cambiamos a la base de datos postgres
    password: 'doma1128', // Cambia esto por tu contraseña real
    port: 5433,
});
