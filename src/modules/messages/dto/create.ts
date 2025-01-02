import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsOptional,
  IsArray,
} from 'class-validator';
import { MessageStatusType } from 'src/types/MessageStatus';

export class CreateMessageDto {
  @IsInt()
  chatId: number;

  @IsInt()
  senderId: number;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsString()
  status?: MessageStatusType;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  files?: Express.Multer.File[] | string[];
}
