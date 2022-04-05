import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TeamModule } from 'src/team/team.module';
import { UserModule } from 'src/user/user.module';
import { RepositoryController } from './controller/repository.controller';
import {
  Repository,
  RepositorySchema,
} from './models/schemas/repository.schema';
import { RepositoryService } from './service/repository.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Repository.name, schema: RepositorySchema },
    ]),
    TeamModule,
    UserModule,
  ],
  controllers: [RepositoryController],
  providers: [RepositoryService],
})
export class RepositoryModule {}
