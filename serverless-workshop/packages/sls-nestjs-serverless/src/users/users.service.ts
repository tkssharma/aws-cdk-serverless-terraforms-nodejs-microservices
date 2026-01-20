import { Injectable } from "@nestjs/common";
import { CreateUserDto, UpdateUserDto, User } from "./users.dto";
import { randomUUID } from "crypto";

@Injectable()
export class UsersService {
  private users: Map<string, User> = new Map();

  findAll(): User[] {
    return Array.from(this.users.values());
  }

  findOne(id: string): User | undefined {
    return this.users.get(id);
  }

  create(createUserDto: CreateUserDto): User {
    const now = new Date().toISOString();
    const user: User = {
      id: randomUUID(),
      ...createUserDto,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(user.id, user);
    return user;
  }

  update(id: string, updateUserDto: UpdateUserDto): User | undefined {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      return undefined;
    }

    const updatedUser: User = {
      ...existingUser,
      ...updateUserDto,
      updatedAt: new Date().toISOString(),
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  remove(id: string): boolean {
    return this.users.delete(id);
  }
}
