import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../common/decorators/roles.decorator';
import { SessionPayload } from '../common/constants';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // If no roles are required, allow access
        if (!requiredRoles) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user as SessionPayload;

        if (!user) {
            throw new UnauthorizedException();
        }

        const hasRole = requiredRoles.some((role) => user.role?.toLowerCase() === role.toLowerCase());

        if (!hasRole) {
            throw new ForbiddenException('You do not have permission to access this resource');
        }

        return true;
    }
}
