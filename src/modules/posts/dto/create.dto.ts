import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @IsInt()
  communityId: number;

  @IsString()
  creatorId: string;

  @IsString()
  text: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  files?: Express.Multer.File[] | string[];
}
