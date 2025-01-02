import { IsInt, IsOptional, IsString, IsArray } from 'class-validator';

export class CreatePostDto {
  @IsInt()
  communityId: number;

  @IsInt()
  creatorId: number;

  @IsString()
  text: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  files?: Express.Multer.File[] | string[];
}
