import { IsArray, IsString, IsOptional } from 'class-validator';
import { ChatType } from 'src/types/ChatType';

export class CreateChatDto {
  @IsArray({ message: 'Users must be an array of strings.' })
  users: string[];

  @IsOptional()
  @IsString({ message: 'Chat name must be a string.' })
  chatName?: string;

  @IsOptional()
  @IsString({ message: 'Type name must be a string.' })
  type?: ChatType = 'private';

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  avatar?: Express.Multer.File | string;

  readonly creatorId: number;
}
