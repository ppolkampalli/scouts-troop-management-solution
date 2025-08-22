import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import { JWTPayload } from '@/types';

export const generateAccessToken = (payload: any): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

export const generateRefreshToken = (payload: any): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });
};

export const verifyAccessToken = (token: string): any => {
  return jwt.verify(token, env.JWT_SECRET) as any;
};

export const verifyRefreshToken = (token: string): any => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as any;
};

export const verifyToken = (token: string, secret: string): any => {
  return jwt.verify(token, secret) as any;
};