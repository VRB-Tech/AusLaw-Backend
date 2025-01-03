import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FileUploader } from 'src/middlewares/FileUploader';
import { Community } from 'src/modules/communities/entities/Community';
import { User } from 'src/modules/users/users.model';
import { Comment } from '../comments/entities/Comment';
import { Reaction } from '../comments/entities/Reaction';
import { CreatePostDto } from './dto/create.dto';
import { UpdatePostDto } from './dto/update.dto';
import { Post } from './posts.model';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post)
    private postModel: typeof Post,
    private readonly fileUploader: FileUploader,
  ) {}

  async create(createPostDto: CreatePostDto) {
    const userExists = await User.findByPk(createPostDto.creatorId);
    if (!userExists) throw new NotFoundException('Creator not found');

    const communityExists = await Community.findByPk(createPostDto.communityId);
    if (!communityExists) throw new NotFoundException('Community not found');

    const uploadedFiles = await this.fileUploader.uploadFiles(createPostDto.files);

    const post = await this.postModel.create({
      ...createPostDto,
      files: uploadedFiles,
    });

    return this.postModel.findByPk(post.id, {
      include: [{ model: User, attributes: ['username', 'photo'], as: 'sender' }],
    });
  }

  async findAll(): Promise<Post[]> {
    return this.postModel.findAll({
      include: [
        { model: User, attributes: ['username'] },
        { model: Community, attributes: ['name'] },
        {
          model: Comment,
          as: 'comments',
          include: [{ model: User, attributes: ['username'] }],
        },
      ],
      order: [
        ['createdAt', 'DESC'],
        [{ model: Comment, as: 'comments' }, 'createdAt', 'ASC'],
      ],
    });
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postModel.findByPk(id, {
      include: [
        { model: User, attributes: ['username'] },
        { model: Community, attributes: ['name'] },
        {
          model: Comment,
          as: 'comments',
          include: [{ model: User, attributes: ['username'] }],
        },
      ],
      order: [
        ['createdAt', 'DESC'],
        [{ model: Comment, as: 'comments' }, 'createdAt', 'ASC'],
      ],
    });

    if (!post) throw new NotFoundException('Post not found');

    return post;
  }

  async findAllByCommunityId(communityId: number): Promise<Post[]> {
    const communityExists = await Community.findByPk(communityId);
    if (!communityExists) throw new NotFoundException('Community not found');

    return this.postModel.findAll({
      where: { communityId },
      include: [
        { model: User, attributes: ['username', 'photo'] },
        {
          model: Comment,
          as: 'comments',
          include: [
            {
              model: User,
              attributes: ['username', 'photo'],
            },
            {
              model: Reaction,
              include: [{ model: User, attributes: ['id', 'username'] }],
            },
          ],
          order: [['createdAt', 'ASC']],
        },
      ],
      order: [
        ['createdAt', 'DESC'],
        [{ model: Comment, as: 'comments' }, 'createdAt', 'ASC'],
      ],
    });
  }

  async update(id: number, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.findOne(id);

    if (!post) throw new NotFoundException('Post not found');

    await post.update(updatePostDto, {
      fields: ['text', 'files', 'communityId', 'creatorId'],
    });

    return post.reload({
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'photo'],
        },
      ],
    });
  }

  async remove(id: number): Promise<Post> {
    const post = await this.findOne(id);

    if (!post) throw new NotFoundException('Post not found');

    await post.destroy();

    return post;
  }

  async likePost(postId: number, userId: number): Promise<Post> {
    const post = await this.findOne(postId);
    if (!post) throw new NotFoundException('Post not found');

    if (post.likes.includes(userId)) {
      throw new BadRequestException('User has already liked this post');
    }

    post.likes = [...post.likes, Number(userId)];
    await post.update({ likes: post.likes });

    return post;
  }

  async unlikePost(postId: number, userId: number): Promise<Post> {
    const post = await this.findOne(postId);
    if (!post) throw new NotFoundException('Post not found');

    if (!post.likes.includes(userId)) {
      throw new BadRequestException('User has not liked this post');
    }

    post.likes = post.likes.filter(id => id !== userId);
    await post.update({ likes: post.likes });

    return post;
  }
}
