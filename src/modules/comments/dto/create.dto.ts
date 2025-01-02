import { IsString, IsOptional, IsArray, IsInt } from 'class-validator';

export class CreateCommentDto {
  @IsInt()
  creatorId: number;

  @IsInt()
  postId: number;

  @IsString()
  text: string;

  @IsOptional()
  @IsArray()
  files?: string[];
}
