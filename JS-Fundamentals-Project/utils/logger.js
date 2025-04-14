// basic loggers
import { LOG_LEVEL, ENABLE_COLORS } from "../configuration/env-variables.js";

// ansi color codes
export const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  underscore: "\x1b[4m",
  blink: "\x1b[5m",
  reverse: "\x1b[7m",
  hidden: "\x1b[8m",

  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

// Log levels
export const logLevels = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  none: 4,
};

// Get current log level
const currentLogLevel = logLevels[LOG_LEVEL] || logLevels.info;

// Helper function to apply colors
function applyColor(text, color) {
  if (!ENABLE_COLORS) return text;
  return `${color}${text}${colors.reset}`;
}

// Format message with timestamp
function formatMessage(message) {
  const timestamp = new Date().toISOString().replace("T", " ").substr(0, 19);
  return `[${timestamp}] ${message}`;
}

// Logger functions
function debug(message, ...args) {
  if (currentLogLevel <= logLevels.debug) {
    console.log(
      applyColor(formatMessage(`DEBUG: ${message}`), colors.dim),
      ...args
    );
  }
}

export function log(message, ...args) {
  if (currentLogLevel <= logLevels.info) {
    console.log(formatMessage(message), ...args);
  }
}

export function logSuccess(message, ...args) {
  if (currentLogLevel <= logLevels.info) {
    console.log(applyColor(formatMessage(message), colors.green), ...args);
  }
}

export function logWarn(message, ...args) {
  if (currentLogLevel <= logLevels.warn) {
    console.warn(
      applyColor(formatMessage(`WARNING: ${message}`), colors.yellow),
      ...args
    );
  }
}

export function logError(message, error, ...args) {
  if (currentLogLevel <= logLevels.error) {
    console.error(applyColor(formatMessage(`ERROR: ${message}`), colors.red));
    if (error) {
      if (error instanceof Error) {
        console.error(
          applyColor(`  ${error.stack || error.message}`, colors.red)
        );
      } else {
        console.error(applyColor(`  ${error}`, colors.red));
      }
    }
    if (args.length > 0) {
      console.error(...args);
    }
  }
}
