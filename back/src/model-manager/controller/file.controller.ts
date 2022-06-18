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
import { RenameDto } from '../models/dto/rename.dto';
import { MoveDto } from '../models/dto/move.dto';

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

  @Get('scan/files/:repoId')
  getFilesByRepoId(@Param('repoId') repoId: string) {
    return this.fileService.getFilesByRepoId(repoId);
  }

  @Get('scan/directories/:repoId')
  getDirectoriesByRepoId(@Param('repoId') repoId: string) {
    return this.fileService.getDirectoriesByRepoId(repoId);
  }

  @Get('scan/full/:repoId')
  getAllInRepoByRepoId(@Param('repoId') repoId: string) {
    return this.fileService.getAllInRepoByRepoId(repoId);
  }

  @Post('check')
  checkIfExists(@Body() objectDto: ObjectDto) {
    return this.fileService.checkIfExists(objectDto);
  }

  @Post('newdir')
  createDirectory(@Body() dirDto: DirectoryDto) {
    return this.fileService.createDirectory(dirDto);
  }

  @Post('rename')
  rename(@Body() renameDto: RenameDto) {
    return this.fileService.renameObject(renameDto);
  }

  @Post('move')
  move(@Body() moveDto: MoveDto) {
    return this.fileService.move(moveDto);
  }

  @Post('download')
  download(@Res({ passthrough: true }) res, @Body() fileDto: FileDto) {
    const fullpath: string = this.fileService.joiner(
      fileDto.repoId,
      fileDto.path,
      fileDto.fullname,
    );
    return this.fileService.checkIfExists(fileDto).pipe(
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
    const buffer = this.fileService.zip(fileDto);
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename=${
        (fileDto.fullname !== '' ? fileDto.fullname : 'root') + '.zip'
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
    const filename: string = file.filename;
    return this.fileService.saveFile(filename, fileDto);
  }

  @Post('delete')
  delete(@Body() objectDto: ObjectDto) {
    return this.fileService.delete(objectDto).pipe(
      map((result) => {
        if (result != false) {
          console.log('True', result);
          console.log(`Deleted ${join(objectDto.path, objectDto.fullname)}`);
          return 'Successfuly deleted';
        } else {
          console.log('False', result);
          return `${join(objectDto.path, objectDto.fullname)} doesn't exists`;
        }
      }),
    );
  }
}
