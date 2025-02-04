import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { FileUploader } from 'src/middlewares/FileUploader';
import { UsersService } from '../users/users.service';
import { CreateOrganisationDto } from './dto/create.dto';
import { UpdateOrganisationDto } from './dto/update.dto';
import { Organisation } from './entities/Organisation';

@Injectable()
export class OrganisationsService {
  constructor(
    @InjectModel(Organisation)
    private readonly organisationModel: typeof Organisation,
    private readonly fileUploader: FileUploader,
    private readonly userService: UsersService,
  ) {}

  async findByEmail(email: string): Promise<Organisation | null> {
    return this.organisationModel.findOne({ where: { email } });
  }

  async findById(id: string): Promise<Organisation | null> {
    return await this.organisationModel.findByPk(id);
  }

  async create(createOrganisationDto: CreateOrganisationDto): Promise<Organisation> {
    const { name, email, password } = createOrganisationDto;

    const account = (await this.findByEmail(email)) || this.userService.findByEmail(email);

    if (account) {
      throw new ConflictException('Account already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.organisationModel.create({
      name,
      email,
      password: hashedPassword,
    });
  }

  async updatePaymentStatus(organisationId: string, paymentStatus: string): Promise<void> {
    await this.organisationModel.update({ paymentStatus }, { where: { id: organisationId } });
  }

  async update(
    id: string,
    updateOrganisationDto: Partial<UpdateOrganisationDto>,
  ): Promise<Organisation> {
    const organisation = await this.organisationModel.findByPk(id);

    if (!organisation) {
      throw new NotFoundException(`Organisation with ID: '${id}' not found`);
    }

    let uploadedFiles: string[] = [];

    if (updateOrganisationDto.photo) {
      const filesToUpload = Array.isArray(updateOrganisationDto.photo)
        ? updateOrganisationDto.photo
        : [updateOrganisationDto.photo];

      const validFilesToUpload = filesToUpload.filter(
        file => typeof file === 'string' || (file as Express.Multer.File).buffer,
      );

      uploadedFiles = await this.fileUploader.uploadFiles(validFilesToUpload);

      if (uploadedFiles.length > 0) {
        updateOrganisationDto.photo = uploadedFiles[0];
      }
    }

    if (updateOrganisationDto.password) {
      updateOrganisationDto.password = await this.updatePassword(
        organisation.id,
        updateOrganisationDto.password,
      );
    }

    return organisation.update(updateOrganisationDto);
  }

  async updateRefreshToken(id: string, refreshToken: string | null): Promise<void> {
    const hashedRefreshToken = refreshToken ? await bcrypt.hash(refreshToken, 10) : null;

    await this.organisationModel.update({ refreshToken: hashedRefreshToken }, { where: { id } });
  }

  async updatePassword(orgId: string, newPassword: string): Promise<string> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.organisationModel.update({ password: hashedPassword }, { where: { id: orgId } });

    return hashedPassword;
  }
}
