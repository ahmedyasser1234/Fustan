import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { COOKIE_NAME } from '../common/constants';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private authService: AuthService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = request.cookies?.[COOKIE_NAME];

        if (!token) {
            throw new UnauthorizedException('Authentication required');
        }

        const payload = await this.authService.verifySession(token);
        if (!payload) {
            throw new UnauthorizedException('Invalid session');
        }

        // Attach user to request for use in controllers
        request.user = payload;
        return true;
    }
}
