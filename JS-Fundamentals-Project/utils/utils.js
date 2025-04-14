import { createInterface } from "readline";
import { colors } from "./logger.js";
import { ENABLE_COLORS } from "../configuration/env-variables.js";

// Create readline interface
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

export function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

export function colorize(text, color) {
  if (!ENABLE_COLORS) return text;
  return `${color}${text}${colors.reset}`;
}

export function clearScreen() {
  console.clear();
}

export function formatCurrency(number, decimals = 2) {
  const options = {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Math.min(decimals, 8),
  };

  // For very small numbers, use more decimals
  if (Math.abs(number) < 0.01 && number !== 0) {
    options.minimumFractionDigits = 6;
    options.maximumFractionDigits = 8;
  } else {
    options.maximumFractionDigits = decimals;
  }

  return new Intl.NumberFormat("en-US", options).format(number);
}

export function formatLargeNumber(number) {
  if (number === null || number === undefined) return "N/A";

  if (number < 1000) {
    return number.toString();
  } else if (number < 1000000) {
    return (number / 1000).toFixed(1) + "K";
  } else if (number < 1000000000) {
    return (number / 1000000).toFixed(1) + "M";
  } else if (number < 1000000000000) {
    return (number / 1000000000).toFixed(1) + "B";
  } else {
    return (number / 1000000000000).toFixed(1) + "T";
  }
}

export function closeReadline() {
  rl.close();
}
