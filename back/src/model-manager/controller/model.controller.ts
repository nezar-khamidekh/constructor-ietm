import {
  Controller,
  Get,
  Param,
  Response,
  StreamableFile,
} from '@nestjs/common';
import { createReadStream } from 'fs';
import { join } from 'path';

@Controller('model')
export class ModelController {
  // Folder with test models
  private folder = 'testmodels';

  constructor() {}

  @Get('default')
  defaultModel(@Response({ passthrough: true }) res): StreamableFile {
    const file = createReadStream(
      join(process.cwd(), this.folder, 'defaultModel.gltf'),
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
          join(process.cwd(), this.folder, 'valve.gltf'),
        );
        return new StreamableFile(valve);
      case 'vice':
        const vice = createReadStream(
          join(process.cwd(), this.folder, 'vice.gltf'),
        );
        return new StreamableFile(vice);
      case 'pump':
        const pump = createReadStream(
          join(process.cwd(), this.folder, 'pump.gltf'),
        );
        return new StreamableFile(pump);
      case 'impeller':
        const impeller = createReadStream(
          join(process.cwd(), this.folder, 'impeller.gltf'),
        );
        return new StreamableFile(impeller);
      default:
        const other = createReadStream(
          join(process.cwd(), this.folder, `${id}.gltf`),
        );
        return new StreamableFile(other);
    }
  }
}
