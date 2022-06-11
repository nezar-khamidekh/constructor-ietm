import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { map } from 'rxjs';
import { ObjectDto } from '../models/dto/object.dto';
import { DirectoryDto } from '../models/dto/directory.dto';
import { FileDto } from '../models/dto/file.dto';
import { FileService } from '../service/file.service';

@Controller('files')
export class FileController {
  constructor(private fileService: FileService) {}

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

  @Post('check')
  checkIfExists(@Body() objectDto: ObjectDto) {
    const fullpath: string = join(
      process.cwd(),
      'repositories',
      objectDto.repoId,
      objectDto.path,
      objectDto.fullname,
    );
    return this.fileService.checkIfExists(fullpath);
  }

  @Post('newdir')
  createDirectory(@Body() dirDto: DirectoryDto) {
    const fullpath: string = join(
      process.cwd(),
      'repositories',
      dirDto.repoId,
      dirDto.path,
      dirDto.fullname,
    );
    return this.fileService.createDirectory(fullpath);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
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
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() fileDto: FileDto,
  ) {
    const oldpath: string = join(process.cwd(), 'buffer', file.filename);
    const fullpath: string = join(
      process.cwd(),
      'repositories',
      fileDto.repoId,
      fileDto.path,
      fileDto.fullname,
    );
    return this.fileService.saveFile(oldpath, fullpath);
  }

  @Post('delete')
  deleteFileOrDirectory(@Body() objectDto: ObjectDto) {
    const fullpath: string = join(
      process.cwd(),
      'repositories',
      objectDto.repoId,
      objectDto.path,
      objectDto.fullname,
    );
    console.log(fullpath);
    return this.fileService.deleteFileOrDirectory(fullpath);
  }
}
