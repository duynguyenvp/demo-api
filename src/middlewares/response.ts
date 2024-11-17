import logger from "../logger";

export const responseFormatter = (_req: any, res: any, next: any) => {
  res.success = (data: any, metadata = {}, links = {}) => {
    res.status(200).json({
      status: "success",
      data,
      metadata,
      links
    });
  };

  res.error = (message: string, code = 400, details = {}) => {
    res.status(code).json({
      status: "error",
      error: {
        code,
        message,
        details
      },
      metadata: {
        timestamp: new Date().toISOString()
      }
    });
  };

  next();
};

export const errorHandler = (err: any, _req: any, res: any, next: any) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  logger.error(message + JSON.stringify(err));
  res.error(message, statusCode, {
    stack: process.env.NODE_ENV === "production" ? null : err.stack
  });
  next();
};

export function notFound(err: any, _req: any, res: any, next: any) {
  const statusCode = err.statusCode || 404;
  const message = err.message || "Not Found";

  res.error(message, statusCode, {
    stack: process.env.NODE_ENV === "production" ? null : err.stack
  });
  next();
}
