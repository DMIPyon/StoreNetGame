"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const init_1 = require("./db/init");
const games_routes_1 = __importDefault(require("./routes/games.routes"));
const categories_routes_1 = __importDefault(require("./routes/categories.routes"));
const app = (0, express_1.default)();
const port = 3001;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Rutas
app.use('/api', games_routes_1.default);
app.use('/api', categories_routes_1.default);
// Inicializar la base de datos
(0, init_1.initDatabase)().then(() => {
    // Iniciar el servidor
    app.listen(port, () => {
        console.log(`Servidor corriendo en el puerto ${port}`);
    });
}).catch(error => {
    console.error('Error al inicializar la aplicación:', error);
});
