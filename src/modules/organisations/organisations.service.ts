import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { CreateOrganisationDto } from './dto/create.dto';
import { Organisation } from './entities/Organisation';

@Injectable()
export class OrganisationsService {
  constructor(
    @InjectModel(Organisation)
    private readonly organisationModel: typeof Organisation,
  ) {}

  async findByEmail(email: string): Promise<Organisation | null> {
    return this.organisationModel.findOne({ where: { email } });
  }

  async findById(id: string): Promise<Organisation | null> {
    return this.organisationModel.findByPk(id);
  }

  async create(createOrganisationDto: CreateOrganisationDto): Promise<Organisation> {
    const { name, email, password } = createOrganisationDto;

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
    updateOrganisationDto: Partial<CreateOrganisationDto>,
  ): Promise<Organisation> {
    const organisation = await this.organisationModel.findByPk(id);

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
