"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
const redis_1 = require("redis");
const logger_1 = __importDefault(require("../utils/logger"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.redisClient = (0, redis_1.createClient)({
    url: process.env.REDIS_URL,
});
exports.redisClient.on('error', (err) => logger_1.default.error({ err }, 'Redis Client Error'));
exports.redisClient.connect()
    .then(() => logger_1.default.info('Redis connected'))
    .catch((err) => logger_1.default.error({ err }, 'Redis connection failed'));
