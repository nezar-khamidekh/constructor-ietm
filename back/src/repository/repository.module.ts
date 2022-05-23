import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { TeamModule } from 'src/team/team.module';
import { UserModule } from 'src/user/user.module';
import { ModelManagerModule } from 'src/model-manager/model-manager.module';
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
    ModelManagerModule,
    AuthModule,
  ],
  controllers: [RepositoryController],
  providers: [RepositoryService],
})
export class RepositoryModule {}
