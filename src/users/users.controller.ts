import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
  ) {}

  @Post()
  create(@Body() body: CreateUserDto) {
    return this.usersService.createUser(
      body.name,
      body.email,
      body.password,
    );
  }

  @Get()
  getUsers() {
    return this.usersService.getUsers();
  }

  @Get(':id')
  getUserById(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.usersService.getUserById(id);
  }

  @Delete(':id')
  deleteUser(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.usersService.deleteUser(id);
  }
}
