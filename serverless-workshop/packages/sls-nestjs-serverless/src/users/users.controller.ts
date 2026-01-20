import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto, UpdateUserDto, User } from "./users.dto";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  findAll(): User[] {
    return this.usersService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string): User {
    const user = this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto): User {
    return this.usersService.create(createUserDto);
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto): User {
    const user = this.usersService.update(id, updateUserDto);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id") id: string): void {
    const deleted = this.usersService.remove(id);
    if (!deleted) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}
