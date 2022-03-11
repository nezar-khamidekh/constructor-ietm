import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { from, map, switchMap } from 'rxjs';
import { UserService } from 'src/user/service/user.service';
import { CreateTeamDto } from '../models/dto/CreateTeam.dto';
import { Team, TeamDocument } from '../models/schemas/team.schema';

@Injectable()
export class TeamService {
  constructor(
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
    private userService: UserService,
  ) {}

  removeAll() {
    return from(this.teamModel.deleteMany());
  }

  create(createTeamDto: CreateTeamDto) {
    const newTeam = new this.teamModel(createTeamDto);
    return from(newTeam.save()).pipe(
      switchMap((team: TeamDocument) => {
        return this.addParticipant(
          createTeamDto.creatorId,
          team._id,
          'author',
        ).pipe(
          map((result) => {
            return true;
          }),
        );
      }),
    );
  }

  addParticipant(userId: string, teamId: string, role: string) {
    return this.userService.findOne(userId).pipe(
      switchMap((user) => {
        return from(this.teamModel.findById(teamId)).pipe(
          switchMap((team) => {
            team.participants.push({
              userId: user._id,
              login: user.login,
              role: role,
            });
            return from(
              this.teamModel.updateOne(
                { _id: team._id },
                {
                  participants: team.participants,
                },
              ),
            );
          }),
        );
      }),
    );
  }

  findUserTeams(userId: string) {
    return from(
      this.teamModel.aggregate([
        { $unwind: '$participants' },
        { $match: { 'participants.userId': userId } },
      ]),
    );
  }

  getAll() {
    return from(this.teamModel.find());
  }
}
