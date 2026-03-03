const winston = require('winston');
const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', 'logs');
try {
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }
} catch (err) {
    console.warn('⚠️ Could not create logs directory, using console-only logging');
}

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
);

// Define JSON format for production
const jsonFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
);

// Build transports - always include console, conditionally add file transports
const transports = [
    new winston.transports.Console({
        handleExceptions: true,
    }),
];

// Only add file transports if logs directory is accessible
try {
    fs.accessSync(logsDir, fs.constants.W_OK);
    transports.push(
        new winston.transports.File({ filename: path.join(logsDir, 'error.log'), level: 'error' }),
        new winston.transports.File({ filename: path.join(logsDir, 'combined.log') })
    );
} catch (err) {
    console.warn('⚠️ Logs directory not writable, file logging disabled');
}

const logger = winston.createLogger({
    level: 'info',
    format: process.env.NODE_ENV === 'production' ? jsonFormat : logFormat,
    transports,
    exitOnError: false,
});

// Create a stream object for morgan
logger.stream = {
    write: function (message, encoding) {
        logger.info(message.trim());
    },
};

module.exports = logger;
