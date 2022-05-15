import { Injectable } from '@nestjs/common';
import { ConvertModelDto } from '../model/dto/convertModelDto.dto';
import * as nrc from 'node-run-cmd';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';
import { join, basename, extname } from 'path';
import { from, map } from 'rxjs';

@Injectable()
export class ConverterService {
  DEFAULT_PATH = './buffer/';
  CONVERTER_PATH: string;

  constructor(private configService: ConfigService) {
    this.CONVERTER_PATH = this.configService.get('CONVERTER_PATH');
  }

  convertModel(filePath: string, params: ConvertModelDto) {
    return from(
      isNaN(params.compression)
        ? nrc.run(
            [
              `gltf-converter ${this.inputPath(filePath)} ${this.outputPath(
                filePath,
                params.format,
              )}`,
            ],
            {
              cwd: this.CONVERTER_PATH,
            },
          )
        : nrc.run(
            [
              `gltf-converter ${this.inputPath(filePath)} ${this.outputPath(
                filePath,
                params.format,
              )} --draco --speed=${10 - params.compression}`,
            ],
            {
              cwd: this.CONVERTER_PATH,
            },
          ),
    ).pipe(
      map(() => {
        // TODO: response with converted model
        return true;
      }),
    );
  }

  inputPath(filePath: string) {
    return join(this.DEFAULT_PATH, filePath);
  }

  outputPath(filePath: string, format: string) {
    return join(
      this.DEFAULT_PATH,
      basename(filePath, extname(filePath)) + '.' + format,
    );
  }

  deleteModel(path: string) {
    return from(
      fs.promises
        .rm(path, { force: true, recursive: true })
        .then(() => true)
        .catch(() => false),
    );
  }
}
