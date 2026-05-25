import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcrypt';

type User = {
  id: number;
  name: string;
  email: string;
  password: string;
  created_at: Date;
};

@Injectable()
export class UsersService {
  constructor(private db: DatabaseService) {}

  async createUser(name: string, email: string, password: string) {
    const existingUser = await this.db.query<User>(
      'SELECT * FROM users WHERE email = $1',
      [email],
    );

    if (existingUser.rows.length > 0) {
      throw new BadRequestException(
        'Email already exists',
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users(name, email, password)
      VALUES($1, $2, $3)
      RETURNING *
    `;

    const values = [name, email, hashedPassword];

    const result = await this.db.query<User>(
      query,
      values,
    );

    return result.rows[0];
  }

  async getUsers() {
    const result = await this.db.query<User>(
      'SELECT id, name, email, created_at FROM users',
    );

    return result.rows;
  }

  async deleteUser(id: number) {
  const result = await this.db.query<User>(
    'DELETE FROM users WHERE id = $1 RETURNING *',
    [id],
  );

  if (result.rows.length === 0) {
    throw new BadRequestException(
      'User not found',
    );
  }

  return {
    message: 'User deleted successfully',
    user: result.rows[0],
  };
}
    async getUserById(id: number) {
        const result = await this.db.query<User>(
            `
            SELECT id, name, email, created_at
            FROM users
            WHERE id = $1
            `,
            [id],
        );

        if (result.rows.length === 0) {
            throw new BadRequestException(
            'User not found',
            );
        }

        return result.rows[0];
    }
}

