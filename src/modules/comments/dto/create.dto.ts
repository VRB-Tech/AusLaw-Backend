import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsInt()
  creatorId: string;

  @IsInt()
  postId: number;

  @IsString()
  text: string;

  @IsOptional()
  @IsArray()
  files?: string[];
}
