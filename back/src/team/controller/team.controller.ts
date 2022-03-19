import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AddParticipantDto } from '../models/dto/addParticipant.dto';
import { CreateTeamDto } from '../models/dto/CreateTeam.dto';
import { RemoveParticipantDto } from '../models/dto/removeParticipamt.dto';
import { UpdateParticipantDto } from '../models/dto/updateParticipant.dto';
import { TeamDocument } from '../models/schemas/team.schema';
import { TeamService } from '../service/team.service';

@Controller('team')
export class TeamController {
  constructor(private teamService: TeamService) {}

  @Post('create')
  createTeam(@Body() createTeamDto: CreateTeamDto): Observable<TeamDocument> {
    return this.teamService.createOne(createTeamDto);
  }

  @Get('all')
  getAllTeams() {
    return this.teamService.getAll();
  }

  @Get('one/:id')
  getTeamById(@Param('id') id: string): Observable<TeamDocument> {
    return this.teamService.getOneById(id);
  }

  @Get('user/:enrty')
  getTeamsByUser(@Param('enrty') enrty: string): Observable<TeamDocument[]> {
    return this.teamService.getManyByUser(enrty);
  }

  @Post('participant/add')
  addPerticipantToTheTeam(
    @Body() participantDto: AddParticipantDto,
  ): Observable<boolean> {
    return this.teamService.addParticipant(participantDto);
  }

  @Post('participant/remove')
  removeParticipantFromTheTeam(
    @Body() removeParticipantDto: RemoveParticipantDto,
  ): Observable<boolean> {
    return this.teamService.removeParticipant(removeParticipantDto);
  }

  @Post('participant/update')
  updateParticipantOfTheTeam(
    @Body() updateParticipantDto: UpdateParticipantDto,
  ): Observable<boolean> {
    return this.teamService.updateParticipant(updateParticipantDto);
  }

  @Post('check-title')
  checkIfTeamTitleIsFree(@Body() data: { title: string }): Observable<boolean> {
    return this.teamService.checkIfTeamTitleIsFree(data.title);
  }

  @Get('delete/:id')
  deleteOne(@Param('id') id: string): Observable<boolean> {
    return this.teamService.deleteOne(id);
  }
}
