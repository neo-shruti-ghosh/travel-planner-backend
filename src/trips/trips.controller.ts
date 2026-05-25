import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  ParseIntPipe,
  Delete,
  UseGuards,
  Req,
  Patch
} from '@nestjs/common';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/trip.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateTripDto } from './dto/update-trip.dto';

@Controller('trips')
export class TripsController {
    constructor(
        private tripsService: TripsService,
    ) {}
    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(
    @Req() req,
    @Body() body: CreateTripDto,
    ) {
    return this.tripsService.createTrip(
        req.user.id,
        body,
    );
    }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    getTrips(){
        return this.tripsService.getTrips();
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('my-trips')
    getTripByUserId(
        @Req() req,
    ){
        return this.tripsService.getTripByUserId( req.user.id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    deleteTrip(
        @Param('id', ParseIntPipe)
        id: number,
        @Req() req,
    ) {
        return this.tripsService.deleteTrip(
        id,
        req.user.id,
        );
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id')
    updateTrip(
        @Param('id', ParseIntPipe)
        id: number,
        @Body() body: UpdateTripDto,
        @Req() req,
    ){
        return this.tripsService.updateTrip(
            id,
            req.user.id,
            body
        );
    }
}