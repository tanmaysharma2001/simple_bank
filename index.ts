import app from "./app"
import logger from "./utils/logger"
import config from "./utils/config"

const PORT: number = config.PORT;

// listening over port
app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});