import { Module } from '@nestjs/common';
import { ViewerController } from './controller/viewer.controller';
import { ViewerService } from './service/viewer.service';

@Module({
  controllers: [ViewerController],
  providers: [ViewerService],
})
export class ViewerModule {}
