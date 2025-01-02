import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsArray,
} from 'class-validator';

export class CreateCommunityDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  image?: Express.Multer.File | string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  banner?: Express.Multer.File | string;

  @IsInt()
  @IsNotEmpty()
  creatorId: number;

  @IsArray()
  @IsNotEmpty()
  members?: string[];

  @IsArray()
  @IsNotEmpty()
  admins?: string[];
}
