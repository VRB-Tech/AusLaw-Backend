import { PartialType } from '@nestjs/mapped-types';
import { CreateCommunityDto } from './create.dto';
import { IsOptional, IsArray, IsString, IsInt } from 'class-validator';

export class UpdateCommunityDto extends PartialType(CreateCommunityDto) {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  banner?: string;

  @IsInt()
  @IsOptional()
  creatorId?: number;

  @IsArray()
  @IsOptional()
  members?: string[];

  @IsArray()
  @IsOptional()
  admins?: string[];
}
