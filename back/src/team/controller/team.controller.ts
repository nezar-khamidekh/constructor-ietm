import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateTeamDto } from '../models/dto/CreateTeam.dto';
import { TeamService } from '../service/team.service';

@Controller('team')
export class TeamController {
  constructor(private teamService: TeamService) {}

  @Post('create')
  createTeam(@Body() createTeamDto: CreateTeamDto) {
    return this.teamService.create(createTeamDto);
  }

  @Get('user/:id')
  findTeamsByUser(@Param('id') id: string) {
    return this.teamService.findUserTeams(id);
  }

  @Get('delete_all')
  deleteAll() {
    return this.teamService.removeAll();
  }

  @Get('all')
  getAllTeams() {
    return this.teamService.getAll();
  }
}
