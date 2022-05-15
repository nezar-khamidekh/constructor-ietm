import { Module } from '@nestjs/common';
import { ConverterService } from './service/converter.service';
import { ConverterController } from './controller/converter.controller';

@Module({
  providers: [ConverterService],
  controllers: [ConverterController],
})
export class ConverterModule {}
