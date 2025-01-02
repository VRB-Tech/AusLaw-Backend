import { IsInt, IsOptional, IsString, IsArray } from 'class-validator';
import { User } from 'src/modules/users/users.model';

export class UpdatePostDto {
  @IsOptional()
  @IsInt()
  communityId?: number;

  @IsOptional()
  @IsInt()
  creatorId?: number;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  likes?: number[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  files?: string[];
}
