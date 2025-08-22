import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { errorResponse } from '@/utils/response';

export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: errors,
        });
      }
      return errorResponse(res, 'Invalid request data', 400);
    }
  };
};

export const validateRequest = validate;