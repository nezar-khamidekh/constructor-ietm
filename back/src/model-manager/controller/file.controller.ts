import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { map } from 'rxjs';
import { ObjectDto } from '../models/dto/checkIfExists.dto';
import { FileService } from '../service/file.service';

@Controller('files')
export class FileController {
  constructor(private fileService: FileService) { }
  @Get('repository/:repoId')
  getRepoById(@Param('repoId') repoId: string) {
    return this.fileService.getRepoById(repoId).pipe(
      map((repo) => {
        return repo;
      }),
    );
  }
  @Get(':repoId')
  getFilesByRepoId(@Param('repoId') repoId: string) {
    return this.fileService.getFilesByRepoId(repoId);
  }
  @Post('check/:repoId')
  checkIfExists(@Param('repoId') repoId: string, @Body() objectDto: ObjectDto) {
    return this.fileService.checkIfExists(repoId, objectDto);
  }

}
