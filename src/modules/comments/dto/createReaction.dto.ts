import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateReactionDto {
  @IsInt()
  @IsNotEmpty()
  commentId: number;

  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  emoji: string;
}
