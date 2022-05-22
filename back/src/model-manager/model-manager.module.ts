import { Module } from '@nestjs/common';
import { ModelController } from './controller/model.controller';
import { ModelService } from './service/model.service';

@Module({
  controllers: [ModelController],
  providers: [ModelService],
  exports: [ModelService],
})
export class ModelManagerModule {}
