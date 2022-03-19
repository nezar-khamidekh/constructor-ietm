import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Response,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { createReadStream } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ViewerService } from '../service/viewer.service';

@Controller('viewer')
export class ViewerController {
  constructor(private viewerService: ViewerService) {}

  @Get('default')
  defaultModel(@Response({ passthrough: true }) res): StreamableFile {
    const file = createReadStream(
      join(process.cwd(), '/testmodels/valve_anim.gltf'),
    );
    return new StreamableFile(file);
  }

  @Get(':id')
  getModel(
    @Response({ passthrough: true }) res,
    @Param('id') id: string,
  ): StreamableFile {
    switch (id) {
      case 'valve':
        const valve = createReadStream(
          join(process.cwd(), '/testmodels/valve_anim.gltf'),
        );
        return new StreamableFile(valve);
      case 'vice':
        const vice = createReadStream(
          join(process.cwd(), '/testmodels/vice.gltf'),
        );
        return new StreamableFile(vice);
      case 'pump':
        const pump = createReadStream(
          join(process.cwd(), '/testmodels/pump.gltf'),
        );
        return new StreamableFile(pump);
      case 'impeller':
        const impeller = createReadStream(
          join(process.cwd(), '/testmodels/impeller.gltf'),
        );
        return new StreamableFile(impeller);
      default:
        const other = createReadStream(
          join(process.cwd(), `/testmodels/${id}.gltf`),
        );
        return new StreamableFile(other);
    }
  }

  @Post('upload')
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
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    let modelPath = file.filename.replace(extname(file.filename), '.gltf');
    let outputPath = 'testmodels/' + modelPath;
    this.viewerService.convertModel(file.path, outputPath);
  }
}
