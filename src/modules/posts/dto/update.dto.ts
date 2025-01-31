import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdatePostDto {
  @IsOptional()
  @IsInt()
  communityId?: number;

  @IsOptional()
  @IsString()
  creatorId?: string;

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
