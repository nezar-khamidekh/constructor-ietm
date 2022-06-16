import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { map, switchMap } from 'rxjs';
import { ObjectDto } from '../models/dto/object.dto';
import { DirectoryDto } from '../models/dto/directory.dto';
import { FileDto } from '../models/dto/file.dto';
import { FileService } from '../service/file.service';
import { createReadStream } from 'fs';

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

  @Post('download')
  download(@Res({ passthrough: true }) res, @Body() fileDto: FileDto) {
    const fullpath: string = join(
      process.cwd(),
      'repositories',
      fileDto.repoId,
      fileDto.path,
      fileDto.fullname,
    );
    return this.fileService.checkIfExists(fullpath).pipe(
      map((result) => {
        if (result == true) {
          const file = createReadStream(fullpath);
          res.set({
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename=${fileDto.fullname}`,
          });
          return new StreamableFile(file);
        } else {
          return `File ${join(fileDto.path, fileDto.fullname)} doesn't exists`;
        }
      }),
    );
  }

  @Post('zip')
  zip(@Res({ passthrough: true }) res, @Body() fileDto: FileDto) {
    const rootpath: string = join(
      process.cwd(),
      'repositories',
      fileDto.repoId,
      fileDto.path,
    );
    const folderpath: string = join(rootpath, fileDto.fullname);
    const buffer = this.fileService.zip(folderpath);
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename=${
        fileDto.fullname + '.zip'
      }`,
    });
    return new StreamableFile(buffer);
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
    return this.fileService.deleteFileOrDirectory(fullpath).pipe(
      map((result) => {
        if (result == true) {
          console.log(`Deleted ${join(objectDto.path, objectDto.fullname)}`);
          return 'Successfuly deleted';
        } else {
          return `${join(objectDto.path, objectDto.fullname)} doesn't exists`;
        }
      }),
    );
  }
}
