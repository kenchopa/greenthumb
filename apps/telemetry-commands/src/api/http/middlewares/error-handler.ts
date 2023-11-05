/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line unused-imports/no-unused-vars
  next: NextFunction,
) => {
  return res.status(err.httpCode || 500).json({
    message: err.message,
    status: err.statusCode || '500',
  });
};

export default errorHandler;
