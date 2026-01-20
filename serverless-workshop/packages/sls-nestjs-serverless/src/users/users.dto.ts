export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
}
