import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserEntryDto } from 'src/user/models/dto/userEntry.dto';
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

  @Post('update')
  updateTeam(@Body() teamData: TeamDocument): Observable<boolean> {
    return this.teamService.updateOne(teamData);
  }

  @Get('all')
  getAllTeams() {
    return this.teamService.getAll();
  }

  @Get('one/:id')
  getTeamById(@Param('id') id: string): Observable<TeamDocument> {
    return this.teamService.getOneById(id);
  }

  @Post('user')
  getTeamsByUser(
    @Param('enrty') userEntryDto: UserEntryDto,
  ): Observable<TeamDocument[]> {
    return this.teamService.getManyByUser(userEntryDto);
  }

  @Post('participant/add')
  addParticipantToTheTeam(
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
