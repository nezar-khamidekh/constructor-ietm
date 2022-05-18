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
import { ConvertModelDto } from '../model/dto/convertModelDto.dto';
import { ConverterService } from '../service/converter.service';

@Controller('converter')
export class ConverterController {
  constructor(private converterService: ConverterService) {}
  @Post('convert')
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
    @Body() convertModelDto: ConvertModelDto,
  ) {
    return this.converterService
      .convertModel(file.filename, convertModelDto)
      .pipe(
        map((path) => {
          const model = createReadStream(join(process.cwd(), path));
          return new StreamableFile(model);
        }),
      );
  }
}
