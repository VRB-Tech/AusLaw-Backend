import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';
import { MessageStatusType } from 'src/types/MessageStatus';

export class UpdateMessageDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  content?: string;

  @IsOptional()
  @IsString()
  status?: MessageStatusType;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  files?: string[];
}
