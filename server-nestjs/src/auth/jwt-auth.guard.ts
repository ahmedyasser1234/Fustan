import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from './auth.service';
import { COOKIE_NAME } from '../common/constants';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { SetMetadata } = require('@nestjs/common');
  return SetMetadata(IS_PUBLIC_KEY, true);
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Skip auth if route is marked @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    const cookieToken = request.cookies?.[COOKIE_NAME];
    
    let token = null;
    let source = 'none';

    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
      source = 'header';
    } else if (cookieToken) {
      token = cookieToken;
      source = 'cookie';
    }

    if (!token || token === 'undefined' || token === 'null') {
      throw new UnauthorizedException('Authentication required');
    }

    const logger = new Logger('JwtAuthGuard');
    logger.debug(`Verifying token from ${source} for ${request.url}`);

    const payload = await this.authService.verifySession(token);
    if (!payload) {
      const logger = new Logger('JwtAuthGuard');
      logger.warn(`Invalid session for request to ${request.url}`);
      throw new UnauthorizedException('Invalid session');
    }

    // Attach user to request for use in controllers
    request.user = payload;
    return true;
  }
}
