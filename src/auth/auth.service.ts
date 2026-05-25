import {
  BadRequestException,
  Injectable, UnauthorizedException
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { DatabaseService } from '../database/database.service';

type User = {
  id: number;
  email: string;
  password: string;
};

@Injectable()
export class AuthService {
  constructor(
    private db: DatabaseService,
    private jwtService: JwtService,
  ) {}

  async login(
  email: string,
  password: string,
) {
  const result = await this.db.query<User>(
    `
      SELECT * FROM users
      WHERE email = $1
    `,
    [email],
  );

  if (result.rows.length === 0) {
    throw new BadRequestException(
      'User does not exist! Sign Up and try again.',
    );
  }

  const user = result.rows[0];

  const isPasswordCorrect =
    await bcrypt.compare(
      password,
      user.password,
    );

  if (!isPasswordCorrect) {
    throw new BadRequestException(
      'Invalid password! Please try again.',
    );
  }

  const token =
    await this.jwtService.signAsync({
      id: user.id,
      email: user.email,
    });

  return {
    access_token: token,
    user: {
      id: user.id,
      email: user.email,
    },
  };
}
async getMe(req: Request) {
  const token = req.cookies.token;

  if (!token) {
    throw new UnauthorizedException();
  }

  const decoded =
    await this.jwtService.verifyAsync(token);

  return {
    user: decoded,
  };
}
}