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
import { map, Observable } from 'rxjs';
import { AddParticipantDto } from 'src/team/models/dto/addParticipant.dto';
import { RemoveParticipantDto } from 'src/team/models/dto/removeParticipant.dto';
import { UpdateParticipantDto } from 'src/team/models/dto/updateParticipant.dto';
import { UserDocument } from 'src/user/models/schemas/user.schema';
import { CreateRepositoryDto } from '../models/dto/createRepository.dto';
import { RegisterModelDto } from '../models/dto/registerModel.dto';
import { RemoveModelDto } from '../models/dto/removeModel.dto';
import { TakeModelDto } from '../models/dto/takeModel.dto';
import { RepositoryDocument } from '../models/schemas/repository.schema';
import { RepositoryService } from '../service/repository.service';

@Controller('repository')
export class RepositoryController {
  constructor(private repositoryService: RepositoryService) {}

  @Post('create')
  createRepository(
    @Body() createRepoDto: CreateRepositoryDto,
  ): Observable<RepositoryDocument> {
    return this.repositoryService.create(createRepoDto);
  }

  @Post('update')
  updateRepository(
    @Body() repositoryData: RepositoryDocument,
  ): Observable<boolean> {
    return this.repositoryService.updateOne(repositoryData);
  }

  @Get('all')
  getAllRepos() {
    return this.repositoryService.getAll();
  }

  @Get('one/:id')
  getRepositoryById(@Param('id') id: string): Observable<RepositoryDocument> {
    return this.repositoryService.getOneById(id);
  }

  @Get('user/:id')
  getReposByUser(@Param('id') id: string): Observable<RepositoryDocument[]> {
    return this.repositoryService.getUserRepos(id);
  }

  @Get('team/:id')
  getReposByTeam(@Param('id') id: string): Observable<RepositoryDocument[]> {
    return this.repositoryService.getTeamRepos(id);
  }

  @Post('participant/add')
  addParticipantToTheRepository(
    @Body() participantDto: AddParticipantDto,
  ): Observable<UserDocument | boolean> {
    return this.repositoryService.addParticipant(participantDto);
  }

  @Post('participant/remove')
  removeParticipantFromTheRepository(
    @Body() removeParticipantDto: RemoveParticipantDto,
  ): Observable<boolean> {
    return this.repositoryService.removeParticipant(removeParticipantDto);
  }

  @Post('participant/update')
  updateParticipantOfTheRepository(
    @Body() updateParticipantDto: UpdateParticipantDto,
  ): Observable<boolean> {
    return this.repositoryService.updateParticipant(updateParticipantDto);
  }

  @Get('delete/:id')
  deleteOne(@Param('id') id: string): Observable<boolean> {
    return this.repositoryService.deleteOne(id);
  }

  @Post('model/add')
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
  registerModel(
    @UploadedFile() file: Express.Multer.File,
    @Body() registerModelDto: RegisterModelDto,
  ) {
    return this.repositoryService.registerModel(file, registerModelDto.repoId);
  }

  @Post('model/remove')
  removeModel(@Body() removeModelDto: RemoveModelDto) {
    return this.repositoryService.removeModel(removeModelDto);
  }

  @Post('model/take')
  takeModel(
    @Body() takeModelDto: TakeModelDto,
    @Response({ passthrough: true }) res,
  ): Observable<StreamableFile> {
    return this.repositoryService.takeModel(takeModelDto).pipe(
      map((model) => {
        const valve = createReadStream(
          join(
            process.cwd(),
            '/repositories/' + takeModelDto.repoId + '/' + model.path,
          ),
        );
        return new StreamableFile(valve);
      }),
    );
  }
}
