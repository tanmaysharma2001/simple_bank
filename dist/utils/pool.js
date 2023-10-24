"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("./config"));
const Pool = require('pg').Pool;
const pool = new Pool({
    user: config_1.default.PG_USER,
    host: config_1.default.PG_HOST,
    database: config_1.default.PG_DATABASE,
    password: config_1.default.PG_PASSWORD,
    port: config_1.default.PG_PORT,
});
exports.default = pool;
