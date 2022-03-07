import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ViewerController } from './controller/viewer.controller';
import { Cat, CatSchema } from './models/schemas/cat.schema';
import { ViewerService } from './service/viewer.service';

@Module({
  controllers: [ViewerController],
  providers: [ViewerService],
})
export class ViewerModule {}
