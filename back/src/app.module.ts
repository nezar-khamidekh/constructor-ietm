import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ModelManagerModule } from './model-manager/model-manager.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TeamModule } from './team/team.module';
import { RepositoryModule } from './repository/repository.module';

const modules = [
  ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', './.env'] }),
  MongooseModule.forRoot(process.env.DATABASE_URL),
  UserModule,
  AuthModule,
  ModelManagerModule,
  TeamModule,
  RepositoryModule,
];

if (process.env.NODE_ENV !== 'development') {
  modules.push(
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '', 'build/constructor'),
    }),
  );
}

@Module({
  imports: modules,
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
