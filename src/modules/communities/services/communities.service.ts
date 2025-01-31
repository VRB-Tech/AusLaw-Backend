import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { FileUploader } from 'src/middlewares/FileUploader';
import { User } from 'src/modules/users/users.model';
import { CreateCommunityDto } from '../dto/create.dto';
import { UpdateCommunityDto } from '../dto/update.dto';
import { Community } from '../entities/Community';

@Injectable()
export class CommunityService {
  constructor(
    @InjectModel(Community)
    private communityModel: typeof Community,
    private readonly fileUploader: FileUploader,
    @InjectModel(User)
    private usersModel: typeof User,
  ) {}

  async create(createCommunityDto: CreateCommunityDto): Promise<Community> {
    let uploadedFiles: string[] = [];
    let imageFile = null;
    let bannerFile = null;

    if (createCommunityDto.image) {
      const filesToUpload = Array.isArray(createCommunityDto.image)
        ? createCommunityDto.image
        : [createCommunityDto.image];

      const validFilesToUpload = filesToUpload.filter(
        file => typeof file === 'string' || (file as Express.Multer.File).buffer,
      );

      const uploadedImages = await this.fileUploader.uploadFiles(validFilesToUpload);

      uploadedFiles.unshift(...uploadedImages);
      imageFile = uploadedFiles[0];
    }

    if (createCommunityDto.banner) {
      const filesToUpload = Array.isArray(createCommunityDto.banner)
        ? createCommunityDto.banner
        : [createCommunityDto.banner];

      const validFilesToUpload = filesToUpload.filter(
        file => typeof file === 'string' || (file as Express.Multer.File).buffer,
      );

      const uploadedBanner = await this.fileUploader.uploadFiles(validFilesToUpload);

      uploadedFiles.push(...uploadedBanner);
      bannerFile = uploadedFiles[uploadedFiles.length - 1];
    }

    const existingUsers = await this.usersModel.findAll({
      where: {
        id: [...createCommunityDto.members, ...createCommunityDto.admins],
      },
    });

    if (!existingUsers.length) {
      throw new Error('Some user IDs do not exist');
    }

    const communityData = {
      ...createCommunityDto,
      image: imageFile || null,
      banner: bannerFile || null,
    };

    const community = await this.communityModel.create(communityData);

    await community.$set(
      'usersInfo',
      existingUsers.map(member => member.id),
    );

    return this.communityModel.findByPk(community.id, {
      include: [{ model: User, through: { attributes: [] } }],
    });
  }

  async addUserToCommunity(id: number, userId: string): Promise<Community> {
    const community = await this.findOne(id);

    if (!community) {
      throw new NotFoundException('Community not found');
    }

    const userIdString = userId.toString();

    if (!community.members.includes(userIdString)) {
      community.members.push(userIdString);

      await this.communityModel.update({ members: community.members }, { where: { id } });
    }

    const existingUsers = await this.usersModel.findAll({
      where: { id: [...community.members, ...community.admins] },
    });

    await community.$set(
      'usersInfo',
      existingUsers.map(member => member.id),
    );

    return this.communityModel.findByPk(community.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'photo'],
          through: { attributes: [] },
        },
      ],
    });
  }

  async findAll(): Promise<Community[]> {
    return this.communityModel.findAll();
  }

  async findOne(id: number): Promise<Community> {
    const community = await this.communityModel.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'photo'],
          through: { attributes: [] },
        },
      ],
    });

    if (!community) throw new NotFoundException('Community not found');

    return community;
  }

  async findAllByUserId(userId: number): Promise<Community[]> {
    const communities = await this.communityModel.findAll({
      where: {
        [Op.or]: [
          {
            members: {
              [Op.contains]: [userId],
            },
          },
        ],
      },
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'photo'],
          through: { attributes: [] },
        },
      ],
    });

    return communities;
  }

  async update(id: number, updateCommunityDto: UpdateCommunityDto): Promise<Community> {
    const community = await this.findOne(id);

    if (updateCommunityDto.members || updateCommunityDto.admins) {
      let allUserIds = [];

      if (updateCommunityDto.members) {
        allUserIds = [...new Set([...community.admins, ...updateCommunityDto.members])];
      }

      if (updateCommunityDto.admins) {
        allUserIds = [...new Set([...community.members, ...updateCommunityDto.admins])];
      }

      const existingUsers = await this.usersModel.findAll({
        where: { id: allUserIds },
      });

      await community.$set('usersInfo', []);
      await community.$set(
        'usersInfo',
        existingUsers.map(user => user.id),
      );

      await community.reload({ include: [{ association: 'usersInfo' }] });
    }

    return await community.update(updateCommunityDto);
  }

  async remove(id: number): Promise<Community> {
    const community = await this.findOne(id);

    await community.destroy();

    return community;
  }

  async removeUserFromCommunity(id: number, userId: number): Promise<Community> {
    const community = await this.findOne(id);

    community.members = community.members.filter(member => member !== userId.toString());

    await community.save();

    return community;
  }
}
