import { createLogger, format, transports } from 'winston';
import { TransformableInfo } from 'logform';
import path from 'path';
import fs from 'fs';
import { config } from './env';

// 确保日志目录存在
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 创建日志格式
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
);

// 创建控制台格式
const consoleFormat = format.combine(
  format.colorize(),
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf((info: TransformableInfo) => {
    const { timestamp, level, message, ...rest } = info;
    return `${timestamp} ${level}: ${message} ${
      Object.keys(rest).length ? JSON.stringify(rest, null, 2) : ''
    }`;
  })
);

// 创建logger实例
const logger = createLogger({
  level: config.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'vocabulary-api' },
  transports: [
    // 写入所有级别日志到server.log
    new transports.File({ 
      filename: path.join(logDir, 'server.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // 写入错误日志到error.log
    new transports.File({ 
      filename: path.join(logDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // 开发环境下输出到控制台
    new transports.Console({
      format: consoleFormat,
    }),
  ],
  exceptionHandlers: [
    new transports.File({ 
      filename: path.join(logDir, 'exceptions.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ]
});

// 导出logger实例
export default logger;