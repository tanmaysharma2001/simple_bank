"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const logger_1 = __importDefault(require("./utils/logger"));
const config_1 = __importDefault(require("./utils/config"));
const PORT = config_1.default.PORT;
// listening over port
app_1.default.listen(PORT, () => {
    logger_1.default.info(`Server is running on port ${PORT}`);
});
