import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { FiltersController } from './controllers/filters.controllers';
import { UsersController } from './controllers/users.controller';
import { User } from './users.model';
import { UsersService } from './users.service';

@Module({
  imports: [SequelizeModule.forFeature([User])],
  providers: [UsersService],
  controllers: [UsersController, FiltersController],
  exports: [UsersService],
})
export class UsersModule {}
