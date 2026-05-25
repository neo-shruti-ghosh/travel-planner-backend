import { Injectable, OnModuleInit } from '@nestjs/common';
import { Pool, QueryResult, QueryResultRow } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private pool!: Pool;

  async onModuleInit() {
    this.pool = new Pool({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'password',
      database: 'travelplanner',
    });

    const client = await this.pool.connect();

    console.log('PostgreSQL connected successfully');

    client.release();
  }

  query<T extends QueryResultRow>(
    text: string,
    params?: unknown[],
  ): Promise<QueryResult<T>> {
    return this.pool.query<T>(text, params);
  }
}
