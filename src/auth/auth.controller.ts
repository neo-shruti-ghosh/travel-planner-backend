import {
  Body,
  Controller,
  Post,
  Res,
  Get,
  Req
} from '@nestjs/common';
import type { Request } from 'express';
import type { Response } from 'express';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
  ) {}
@Get('me')
getMe(@Req() req: Request) {
  return this.authService.getMe(req);
}
  @Post('login')
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true })
    res: Response,
  ) {
    const result =
      await this.authService.login(
        body.email,
        body.password,
      );

    res.cookie(
      'token',
      result.access_token,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          'production',
        sameSite: 'lax',
        maxAge:
          7 *
          24 *
          60 *
          60 *
          1000,
      },
    );

    return {
      user: result.user,
    };
  }
}