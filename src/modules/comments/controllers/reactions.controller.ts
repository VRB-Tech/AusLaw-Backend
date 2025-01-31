import { Body, Controller, Delete, NotFoundException, Param, Post } from '@nestjs/common';
import { Reaction } from '../entities/Reaction';
import { ReactionsService } from '../services/reactions.service';

@Controller('reactions')
export class ReactionsController {
  constructor(private readonly reactionsService: ReactionsService) {}

  @Post('add/:commentId')
  async addReaction(
    @Param('commentId') commentId: string,
    @Body('userId') userId: string,
    @Body('emoji') emoji: string,
  ): Promise<Reaction> {
    if (!userId || !emoji) {
      throw new NotFoundException('User ID or Emoji is missing');
    }

    return this.reactionsService.addReaction(+commentId, userId, emoji);
  }

  @Delete('remove/:commentId')
  async removeReaction(
    @Param('commentId') commentId: string,
    @Body('userId') userId: string,
    @Body('emoji') emoji: string,
  ): Promise<Reaction> {
    if (!userId || !commentId) {
      throw new NotFoundException('User ID or Comment is missing');
    }

    return this.reactionsService.removeReaction(+commentId, userId, emoji);
  }
}
