import { Controller, Get, Param } from '@nestjs/common';
import { FileService } from '../service/file.service';

@Controller('files')
export class FileController {
  constructor(private fileService: FileService) { }
  @Get(':repoId')
  getFilesByRepoId(@Param('repoId') repoId: string) {
    return `Hello World! Repo: ${repoId}`
  }
}
