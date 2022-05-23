import { Controller, Get, Param } from '@nestjs/common';
import { map } from 'rxjs';
import { FileService } from '../service/file.service';

@Controller('files')
export class FileController {
  constructor(private fileService: FileService) { }
  @Get('repository/:repoId')
  getRepoById(@Param('repoId') repoId: string) {
    return this.fileService.getRepoById(repoId).pipe(map((repo) => {
      return repo;
    }));
  }
  @Get(':repoId')
  getFilesByRepoId(@Param('repoId') repoId: string) {
    return this.fileService.getFilesByRepoId(repoId);
  }
}
