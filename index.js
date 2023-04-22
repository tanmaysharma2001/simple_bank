const app = require('./app');
const logger = require('./utils/logger');
const config = require('./utils/config');

const PORT = config.PORT;

// listening over port
app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});