"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
// Re-exportar la conexión a la base de datos desde config
const database_1 = require("../config/database");
Object.defineProperty(exports, "pool", { enumerable: true, get: function () { return database_1.pool; } });
