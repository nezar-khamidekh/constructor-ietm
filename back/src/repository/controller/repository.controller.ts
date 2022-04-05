import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AddParticipantDto } from 'src/team/models/dto/addParticipant.dto';
import { RemoveParticipantDto } from 'src/team/models/dto/removeParticipamt.dto';
import { UpdateParticipantDto } from 'src/team/models/dto/updateParticipant.dto';
import { UserDocument } from 'src/user/models/schemas/user.schema';
import { CreateRepositoryDto } from '../models/dto/createRepository.dto';
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
}
