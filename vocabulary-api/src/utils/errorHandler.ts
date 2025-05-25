import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

// 自定义错误类
export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// 开发环境错误处理
const sendErrorDev = (err: AppError, res: Response) => {
  res.status(err.statusCode).json({
    success: false,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

// 生产环境错误处理
const sendErrorProd = (err: AppError, res: Response) => {
  // 可操作的、可信的错误：发送消息给客户端
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  } else {
    // 编程错误或未知错误：不泄露错误细节
    logger.error('错误', err);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 处理MongoDB重复键错误
const handleDuplicateKeyError = (err: any) => {
  const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
  const message = `重复的键值: ${value}. 请使用其他值!`;
  return new AppError(message, 400);
};

// 处理MongoDB验证错误
const handleValidationError = (err: any) => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  const message = `无效的输入数据. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// 处理JWT错误
const handleJWTError = () => new AppError('无效的令牌，请重新登录', 401);
const handleJWTExpiredError = () => new AppError('您的令牌已过期，请重新登录', 401);

// 全局错误处理中间件
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;
    
    // 处理特定类型的错误
    if (error.code === 11000) error = handleDuplicateKeyError(error);
    if (error.name === 'ValidationError') error = handleValidationError(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    
    sendErrorProd(error, res);
  }
};

// 捕获异步错误的包装器
export const catchAsync = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}; 