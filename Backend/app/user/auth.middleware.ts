// middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  auth?: {
    id: string;
    role: string;
  };
}

export const authenticateUser = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  
  const token = req.headers.authorization?.replace('Bearer ', '');

  

  console.log("token", token)
  

  if (!token) {
    res.status(401).json({ success: false, message: 'No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
      role: string;
    };


    req.auth = { id: decoded.id, role: decoded.role };
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
