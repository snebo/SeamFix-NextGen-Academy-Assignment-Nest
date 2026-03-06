import { NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    //check for auth token
    const token: string | undefined = req.headers['authorization'];
    if (!token) {
      throw new UnauthorizedException('Access token is missing');
    } else if (!token.startsWith('Bearer ')) {
      throw new UnauthorizedException('invalid token format provided');
    }
    const accessToken: string = token.replace('Bearer ', '');
    if (!this.validateToken(accessToken)) {
      throw new UnauthorizedException('invalid token');
    }
    next();
  }

  private validateToken(token: string): boolean {
    // TODO: add jwt validation;
    return true;
  }
}
