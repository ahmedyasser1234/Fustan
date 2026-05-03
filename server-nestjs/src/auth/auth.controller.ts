import {
  Controller,
  Get,
  Post,
  Res,
  Req,
  Body,
  UseInterceptors,
  UploadedFile,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response, Request } from 'express';
import { COOKIE_NAME, SEVEN_DAYS_MS } from '../common/constants';
import { Logger } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../media/cloudinary.provider';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { FileValidationPipe } from '../common/pipes/file-validation.pipe';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private authService: AuthService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @Post('login')
  async login(@Body() body: any, @Res({ passthrough: true }) res: Response) {
    const isProd = process.env.NODE_ENV === 'production';
    const { token, user } = await this.authService.login(body);

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      path: '/',
      sameSite: isProd ? 'none' : 'lax',
      secure: isProd,
      maxAge: SEVEN_DAYS_MS,
    });

    return { user, token };
  }

  @Get('seed-admin')
  async seedAdmin() {
    return await this.authService.ensureAdminExists();
  }

  @Post('google')
  async googleLogin(
    @Body('token') googleToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const isProd = process.env.NODE_ENV === 'production';
    const { token, user } = await this.authService.loginWithGoogle(googleToken);

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      path: '/',
      sameSite: isProd ? 'none' : 'lax',
      secure: isProd,
      maxAge: SEVEN_DAYS_MS,
    });

    return { user, token };
  }

  @Throttle({ auth: { limit: 3, ttl: 60000 } })
  @Post('register')
  @UseInterceptors(FileInterceptor('logo'))
  async register(
    @Body() body: any,
    @UploadedFile(new FileValidationPipe()) logo: Express.Multer.File,
    @Res({ passthrough: true }) res: Response,
  ) {
    const isProd = process.env.NODE_ENV === 'production';
    try {
      // Upload logo if present
      let logoUrl = null;
      if (logo) {
        const result = await this.cloudinary.uploadFile(logo);
        if ('secure_url' in result) {
          logoUrl = result.secure_url;
        }
      }

      const { token, user } = await this.authService.register({
        ...body,
        logo: logoUrl,
      });

      res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        path: '/',
        sameSite: isProd ? 'none' : 'lax',
        secure: isProd,
        maxAge: SEVEN_DAYS_MS,
      });

      return { user, token };
    } catch (error) {
      this.logger.error(`Register Controller Error: ${error.message}`);
      throw error;
    }
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    const isProd = process.env.NODE_ENV === 'production';
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      path: '/',
      sameSite: isProd ? 'none' : 'lax',
      secure: isProd,
    });
    return { success: true };
  }

  @Get('me')
  async me(@Req() req: Request) {
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : req.cookies?.[COOKIE_NAME];

    if (!token) return { user: null, token: null };

    const payload = await this.authService.verifySession(token);
    if (!payload) return { user: null, token: null };

    const user = await this.authService.findUserByOpenId(payload.openId);
    return { user, token };
  }

  @Get('profile')
  async getProfile(@Req() req: Request) {
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : req.cookies?.[COOKIE_NAME];

    if (!token) throw new UnauthorizedException();

    const payload = await this.authService.verifySession(token);
    if (!payload) throw new UnauthorizedException();

    const user = await this.authService.findUserByOpenId(payload.openId);
    if (!user) throw new UnauthorizedException();

    return user;
  }

  @Post('profile')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateProfile(
    @Req() req: Request,
    @Body() body: any,
    @UploadedFile(new FileValidationPipe()) avatar: Express.Multer.File,
  ) {
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : req.cookies?.[COOKIE_NAME];

    if (!token) throw new UnauthorizedException();

    const payload = await this.authService.verifySession(token);
    if (!payload) throw new UnauthorizedException();

    const updateData = { ...body };

    if (avatar) {
      const result = await this.cloudinary.uploadFile(avatar);
      if ('secure_url' in result) {
        updateData.avatar = result.secure_url;
      }
    }

    return this.authService.updateProfile(payload.id, updateData);
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const isProd = process.env.NODE_ENV === 'production';
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : req.cookies?.[COOKIE_NAME];

    if (!token) throw new UnauthorizedException('No token provided');

    const payload = await this.authService.verifySession(token);
    if (!payload) throw new UnauthorizedException('Invalid or expired token');

    const newToken = await this.authService.refreshSession(payload);

    res.cookie(COOKIE_NAME, newToken, {
      httpOnly: true,
      path: '/',
      sameSite: isProd ? 'none' : 'lax',
      secure: isProd,
      maxAge: SEVEN_DAYS_MS,
    });

    return { token: newToken };
  }
}
