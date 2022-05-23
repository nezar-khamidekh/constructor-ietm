import { Module } from '@nestjs/common';
import { ConverterController } from './controller/converter.controller';
import { FileController } from './controller/file.controller';
import { ModelController } from './controller/model.controller';
import { ConverterService } from './service/converter.service';
import { FileService } from './service/file.service';
import { ModelService } from './service/model.service';

@Module({
  controllers: [ModelController, ConverterController, FileController],
  providers: [ModelService, ConverterService, FileService],
  exports: [ModelService, ConverterService, FileService],
})
export class ModelManagerModule { }
