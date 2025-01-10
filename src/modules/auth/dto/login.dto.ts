import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class loginDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsNotEmpty()
  @IsString()
  type: 'user' | 'organisation';
}
