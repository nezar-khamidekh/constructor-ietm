import { Controller, Get, Response, StreamableFile } from '@nestjs/common';
import { createReadStream } from 'fs';
import { join } from 'path';

@Controller('viewer')
export class ViewerController {
  constructor() {}

  @Get('default')
  defaultModel(@Response({ passthrough: true }) res): StreamableFile {
    const file = createReadStream(
      join(process.cwd(), '/testmodels/valve.gltf'),
    );
    return new StreamableFile(file);
  }
}
