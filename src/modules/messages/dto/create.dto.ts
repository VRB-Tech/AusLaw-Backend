import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { MessageStatusType } from 'src/types/MessageStatus';

export class CreateMessageDto {
  @IsInt()
  chatId: number;

  @IsString()
  senderId: string;

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
