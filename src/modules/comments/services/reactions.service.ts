import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'src/modules/users/users.model';
import { Comment } from '../entities/Comment';
import { Reaction } from '../entities/Reaction';

@Injectable()
export class ReactionsService {
  constructor(
    @InjectModel(Reaction) private readonly reactionModel: typeof Reaction,
    @InjectModel(Comment) private readonly commentModel: typeof Comment,
    @InjectModel(User) private readonly userModel: typeof User,
  ) {}
  async addReaction(commentId: number, userId: string, emoji: string): Promise<Reaction> {
    const comment = await this.commentModel.findByPk(commentId);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    let reaction = await this.reactionModel.findOne({
      where: { commentId, emoji },
    });

    if (reaction) {
      if (!reaction.reactorIds.includes(userId)) {
        reaction.reactorIds.push(userId);

        await this.reactionModel.update(
          { reactorIds: reaction.reactorIds },
          { where: { id: reaction.id } },
        );
      }
    } else {
      reaction = await this.reactionModel.create({
        commentId,
        emoji,
        reactorId: userId,
        reactorIds: [userId],
      });
    }

    const users = await this.userModel.findAll({
      where: { id: reaction.reactorIds },
    });

    await reaction.$set('reactorsInfo', users);

    return await this.reactionModel.findOne({
      where: { id: reaction.id },
      include: [
        {
          model: User,
          attributes: ['id', 'username'],
          through: {
            attributes: [],
          },
        },
      ],
    });
  }

  async removeReaction(commentId: number, reactorId: string, emoji: string): Promise<Reaction> {
    const reaction = await this.reactionModel.findOne({
      where: { commentId, emoji },
    });

    if (!reaction) {
      throw new NotFoundException('Reaction not found');
    }

    reaction.reactorIds = reaction.reactorIds.filter(id => id !== reactorId);

    reaction.reactorIds.length === 0 ? await reaction.destroy() : await reaction.save();

    const users = await this.userModel.findAll({
      where: { id: reaction.reactorIds },
    });

    await reaction.$set('reactorsInfo', users);

    return reaction;
  }
}
