import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import type { SafeUser } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { SESSION_COOKIE_NAME, getSessionCookieOptions } from './auth.constants';
import { SessionAuthGuard } from './guards/session-auth.guard';
import { AuthRateLimitGuard } from './guards/rate-limit.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseGuards(AuthRateLimitGuard)
  @ApiOperation({ summary: 'Register a new participant user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 409, description: 'Email address already registered' })
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<SafeUser> {
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const { user, rawToken } = await this.authService.register(dto, {
      ipAddress,
      userAgent,
    });

    res.cookie(SESSION_COOKIE_NAME, rawToken, getSessionCookieOptions());

    return user;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthRateLimitGuard)
  @ApiOperation({ summary: 'Authenticate user credentials and establish session' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<SafeUser> {
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const { user, rawToken } = await this.authService.login(dto, {
      ipAddress,
      userAgent,
    });

    res.cookie(SESSION_COOKIE_NAME, rawToken, getSessionCookieOptions());

    return user;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke session and clear session cookie' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<{ message: string }> {
    const rawToken = req.cookies?.[SESSION_COOKIE_NAME];

    if (rawToken) {
      await this.authService.logout(rawToken);
    }

    res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });

    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(SessionAuthGuard)
  @ApiOperation({ summary: 'Get current authenticated user identity' })
  @ApiResponse({ status: 200, description: 'Authenticated user profile' })
  @ApiResponse({ status: 401, description: 'Unauthenticated or session expired' })
  getMe(@CurrentUser() user: any): SafeUser {
    return user as SafeUser;
  }
}
