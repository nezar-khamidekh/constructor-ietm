import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TeamModule } from 'src/team/team.module';
import { UserModule } from 'src/user/user.module';
import { ViewerModule } from 'src/viewer/viewer.module';
import { RepositoryController } from './controller/repository.controller';
import { Favorite, FavoriteSchema } from './models/schemas/favorite.schema';
import {
  Repository,
  RepositorySchema,
} from './models/schemas/repository.schema';
import { RepositoryService } from './service/repository.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Repository.name, schema: RepositorySchema },
      { name: Favorite.name, schema: FavoriteSchema },
    ]),
    TeamModule,
    UserModule,
    ViewerModule,
  ],
  controllers: [RepositoryController],
  providers: [RepositoryService],
})
export class RepositoryModule {}
