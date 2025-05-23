"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const games_routes_1 = __importDefault(require("./routes/games.routes"));
const categories_routes_1 = __importDefault(require("./routes/categories.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const cart_routes_1 = __importDefault(require("./routes/cart.routes"));
const orders_routes_1 = __importDefault(require("./routes/orders.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const init_1 = require("./db/init");
const category_controller_1 = require("./controllers/category.controller");
const express_pino_logger_1 = __importDefault(require("express-pino-logger"));
const logger_1 = __importDefault(require("./utils/logger"));
const path_1 = __importDefault(require("path"));
const express_ejs_layouts_1 = __importDefault(require("express-ejs-layouts"));
const database_1 = require("./config/database");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./config/swagger");
// Configurar variables de entorno
dotenv_1.default.config();
// Inicializar app Express
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Configuración de vistas EJS y layouts
app.set('views', path_1.default.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express_ejs_layouts_1.default);
app.set('layout', 'layout');
// Servir archivos estáticos (CSS, imágenes, JS cliente)
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.use((0, express_pino_logger_1.default)({ logger: logger_1.default }));
// Rutas
app.use('/api/games', games_routes_1.default);
app.use('/api/categories', categories_routes_1.default);
app.use('/api/auth', auth_routes_1.default);
app.use('/api/cart', cart_routes_1.default);
app.use('/api/orders', orders_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
// Documentación de la API
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
// Home renderizado con plantillas EJS
app.get('/', async (req, res, next) => {
    try {
        // Obtener categorías y juegos populares de la base de datos
        const categoriesResult = await database_1.pool.query('SELECT * FROM categories ORDER BY name ASC');
        const popularResult = await database_1.pool.query('SELECT * FROM games ORDER BY rating DESC LIMIT 12');
        res.render('index', {
            title: 'Inicio',
            categories: categoriesResult.rows,
            popularGames: popularResult.rows
        });
    }
    catch (err) {
        next(err);
    }
});
// Manejador de errores global
app.use((err, req, res, next) => {
    logger_1.default.error({ err }, 'Error no controlado');
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'production' ? {} : err
    });
});
// Iniciar servidor
app.listen(PORT, async () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    // Inicializar la base de datos si es necesario
    try {
        if (process.env.INIT_DB === 'true') {
            console.log('Inicializando base de datos...');
            await (0, init_1.initDatabase)();
            console.log('Base de datos inicializada correctamente');
        }
        // Inicializar categorías predefinidas
        await (0, category_controller_1.initializeCategories)();
    }
    catch (error) {
        console.error('Error durante la inicialización:', error);
    }
});
