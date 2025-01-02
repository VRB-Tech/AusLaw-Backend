import { IsArray, IsString, IsOptional } from 'class-validator';
import { ChatType } from 'src/types/ChatType';

export class UpdateChatDto {
  @IsOptional()
  @IsArray({ message: 'Users must be an array of strings.' })
  users?: string[];

  @IsOptional()
  @IsString({ message: 'Chat name must be a string.' })
  chatName?: string;

  @IsOptional()
  @IsString({ message: 'Type name must be a string.' })
  type?: ChatType;

  @IsOptional()
  @IsString({ message: 'Avatar must be url' })
  avatar?: string;
}
