import { Module } from '@nestjs/common';
import { ConverterController } from './controller/converter.controller';
import { ModelController } from './controller/model.controller';
import { ConverterService } from './service/converter.service';
import { ModelService } from './service/model.service';

@Module({
  controllers: [ModelController, ConverterController],
  providers: [ModelService, ConverterService],
  exports: [ModelService, ConverterService],
})
export class ModelManagerModule {}
