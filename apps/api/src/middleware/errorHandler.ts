import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express'

interface HttpError extends Error {
  status?: number
}

export const errorHandler: ErrorRequestHandler = (
  err: HttpError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const status = err.status ?? 500
  // Don't leak internal error messages for 500s
  const message = status < 500 ? err.message : 'Internal server error'
  res.status(status).json({ error: message })
}
