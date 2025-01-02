import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Comment } from '../entities/Comment';
import { CreateCommentDto } from '../dto/create.dto';
import { UpdateCommentDto } from '../dto/update.dto';
import { User } from '../../users/users.model';
import { Reaction } from '../entities/Reaction';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment)
    private readonly commentModel: typeof Comment,
  ) {}

  async create(createCommentDto: CreateCommentDto): Promise<Comment> {
    const userExists = await User.findByPk(createCommentDto.creatorId);

    if (!userExists) {
      throw new NotFoundException('Creator not found');
    }

    const comment = await this.commentModel.create(createCommentDto);

    return this.commentModel.findByPk(comment.id, {
      include: [{ model: User, attributes: ['username', 'photo'] }],
    });
  }

  async findAll(): Promise<Comment[]> {
    return this.commentModel.findAll({
      include: [{ model: User, attributes: ['username'] }],
      order: [['createdAt', 'ASC']],
    });
  }

  async findAllByPostId(postId: number): Promise<Comment[]> {
    return this.commentModel.findAll({
      where: { postId },
      include: [
        {
          model: User,
          attributes: ['username', 'photo'],
        },
        {
          model: Reaction,
          include: [
            {
              model: User,
              attributes: ['id', 'username'],
              through: {
                attributes: [],
              },
            },
          ],
        },
      ],
      order: [['createdAt', 'ASC']],
    });
  }

  async findOne(id: number): Promise<Comment> {
    const comment = await this.commentModel.findByPk(id, {
      include: [{ model: User, attributes: ['username'] }],
    });

    if (!comment) {
      throw new NotFoundException(`Comment with id ${id} not found`);
    }

    return comment;
  }

  async update(
    id: number,
    updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    const comment = await this.findOne(id);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    await comment.update(updateCommentDto);

    return this.commentModel.findByPk(comment.id, {
      include: [{ model: User, attributes: ['username'] }],
    });
  }

  async remove(id: number): Promise<Comment> {
    const comment = await this.findOne(id);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    await comment.destroy();

    return comment;
  }
}
