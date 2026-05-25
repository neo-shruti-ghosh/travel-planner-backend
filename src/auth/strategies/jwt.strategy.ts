import { Injectable } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { PassportStrategy } from '@nestjs/passport';

import {
  Strategy,
} from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
) {
  constructor(
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: (req) => {
        return req?.cookies?.token;
      },
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>(
          'JWT_SECRET',
        )!,
    });
  }

  async validate(payload: any) {
    return payload;
  }
}