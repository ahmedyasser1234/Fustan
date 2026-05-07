import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { COOKIE_NAME } from '../common/constants';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
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

    if (!token) {
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
