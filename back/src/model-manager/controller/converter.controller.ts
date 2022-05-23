import {
  Body,
  Controller,
  Post,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { createReadStream } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { map } from 'rxjs';
import { ManageModelDto } from '../models/dto/manageModel.dto';
import { ConverterService } from '../service/converter.service';

@Controller('converter')
export class ConverterController {
  constructor(private converterService: ConverterService) {}
  @Post()
  @UseInterceptors(
    FileInterceptor('model', {
      storage: diskStorage({
        destination: './buffer/',
        filename: (req, file, cb) => {
          const randomName =
            Array(8)
              .fill(null)
              .map(() => Math.round(Math.random() * 16).toString(16))
              .join('') + extname(file.originalname);
          return cb(null, randomName);
        },
      }),
    }),
  )
  convertAndSendModel(
    @UploadedFile() file: Express.Multer.File,
    @Body() manageModelDto: ManageModelDto,
  ) {
    switch (extname(file.originalname)) {
      case '.gltf':
        return this.converterService
          .compressModel(file.filename, manageModelDto)
          .pipe(
            map((path) => {
              const model = createReadStream(join(process.cwd(), path));
              return new StreamableFile(model);
            }),
          );
      default:
        return this.converterService
          .convertModel(file.filename, manageModelDto)
          .pipe(
            map((path) => {
              const model = createReadStream(join(process.cwd(), path));
              return new StreamableFile(model);
            }),
          );
    }
  }
}
