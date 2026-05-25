import {
  BadRequestException,
  Injectable,
  ForbiddenException
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

type Trip = {
  id: number;
  user_id: number;
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
};

@Injectable()
export class TripsService{
    constructor(private db: DatabaseService) {}

    async createTrip(userId: number, body: {
        title: string,
        description?: string,
        location?: string,
        start_date?: string,
        end_date?: string
    }){
        const existingTrip = await this.db.query<Trip>(
            'SELECT * FROM trips WHERE title = $1',
            [body.title],
        );
        if (existingTrip.rows.length > 0) {
            throw new BadRequestException(
                {
                    message: 'Title already matches an existing trip. Please change the title and try again!',
                    messageKey: 'TRIPS.CREATE.FAILED',
                    status: 400
                }
            );
        }
        const query = `
        INSERT INTO trips(user_Id, title, description, location, start_date, end_date)
        VALUES($1, $2, $3, $4, $5, $6)
        RETURNING *
        `;

        const values = [userId, body.title, body.description ?? null, body.location ?? null, body.start_date ?? null, body.end_date ?? null]

        const result = await this.db.query<Trip>(
            query, values
        );

        return {
            status: 200,
            essage: 'Title already matches an existing trip. Please change the title and try again!',
            messageKey: 'TRIPS.CREATE.SUCCESS',
            result: result.rows[0]
        };
    }

    async getTripByUserId(userId: number){
        const query = `SELECT * FROM trips WHERE user_id = $1`;
        const values = [userId];

        const result = await this.db.query<Trip>(
            query, values
        );

        return {
            status: 200,
            message: 'Trips fetched successfully!',
            messageKey: 'TRIPS.FETCH.SUCCESS',
            result: result.rows
        };
    }  

    async getTrips(){
        const query = `SELECT * FROM trips`;

        const result = await this.db.query<Trip>(
            query
        );

        return {
            status: 200,
            message: 'Trips fetched successfully!',
            messageKey: 'TRIPS.FETCH.SUCCESS',
            result: result.rows
        };
    }  

    async deleteTrip(
    tripId: number,
    userId: number,
  ) {
    const trip = await this.db.query<Trip>(
      `
      SELECT * FROM trips
      WHERE id = $1
      `,
      [tripId],
    );

    if (trip.rows.length === 0) {
      throw new BadRequestException(
        {
            status: 400,
            messageKey: 'TRIPS.DELETE.FAILED',
            message: 'Trip does not exist!',
        }
      );
    }

    if (trip.rows[0].user_id !== userId) {
      throw new BadRequestException(
        {
            status: 403,
            messageKey: 'TRIPS.DELETE.FAILED',
            message: 'You cannot delete this trip!',
        }
      );
    }

    await this.db.query(
      `
      DELETE FROM trips
      WHERE id = $1
      `,
      [tripId],
    );

    return {
        status: 200,
        messageKey: 'TRIPS.DELETE.SUCCESS',
        message: 'Trip deleted successfully',
    };
  }

  async updateTrip(
    tripId: number,
    userId: number,
    body: {
        title?: string,
        description?: string,
        location?: string,
        start_date?: string,
        end_date?: string
    }
  ){
    const existingTrip = await this.db.query<Trip>(
            `SELECT * FROM trips WHERE id = $1`,
            [tripId],
        );
        if (existingTrip.rows.length === 0) {
            throw new BadRequestException(
                {
                    message: 'Trip does not exist!',
                    messageKey: 'TRIPS.UPDATE.FAILED',
                    status: 400
                }
            );
        }
        if(existingTrip.rows[0].user_id !== userId) {
            throw new ForbiddenException(
                {
                    message: 'You cannot update this trip!',
                    messageKey: 'TRIPS.UPDATE.FAILED',
                    status: 403
                }
            );
        }
        const updates: string[] = [];
        const values: unknown[] = [];

        let index = 1;

        if (body.title !== undefined) {
            updates.push(`title = $${index++}`);
            values.push(body.title);
        }

        if (body.description !== undefined) {
            updates.push(
            `description = $${index++}`,
            );
            values.push(body.description);
        }

        if (body.location !== undefined) {
            updates.push(`location = $${index++}`);
            values.push(body.location);
        }

        if (body.start_date !== undefined) {
            updates.push(
            `start_date = $${index++}`,
            );
            values.push(body.start_date);
        }

        if (body.end_date !== undefined) {
            updates.push(`end_date = $${index++}`);
            values.push(body.end_date);
        }

        values.push(tripId);

        const query = `
            UPDATE trips
            SET ${updates.join(', ')}
            WHERE id = $${index}
            RETURNING *
        `;

        const result =
            await this.db.query<Trip>(
            query,
            values,
            );

        return result.rows[0];
        
  }
}