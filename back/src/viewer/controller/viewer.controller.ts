import {
  Controller,
  Get,
  Param,
  Response,
  StreamableFile,
} from '@nestjs/common';
import { createReadStream } from 'fs';
import { join } from 'path';
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
}
