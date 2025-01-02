import { IsString, IsOptional, IsArray } from 'class-validator';

export class UpdateCommentDto {
  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsArray()
  files?: string[];
}
