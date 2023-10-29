import winston from 'winston';

const {
  format: { json, simple, timestamp, colorize },
} = winston;

const jsonFormat = [timestamp(), json()];
const textFormat = [colorize(), simple()];

export default function getOutputFormat() {
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction ? jsonFormat : textFormat;
}
