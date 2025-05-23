"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const pg_1 = require("pg");
// Cargar variables de entorno
dotenv_1.default.config();
// Configuración de prueba explícita
const dbConfig = {
    host: 'localhost',
    port: 5433,
    user: 'postgres',
    password: 'doma1128',
    database: 'netgames'
};
exports.pool = new pg_1.Pool(dbConfig);
