import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { from, map, Observable, switchMap } from 'rxjs';
import { UserEntryDto } from 'src/user/models/dto/userEntry.dto';
import { UserService } from 'src/user/service/user.service';
import { AddParticipantDto } from '../models/dto/addParticipant.dto';
import { CreateTeamDto } from '../models/dto/CreateTeam.dto';
import { RemoveParticipantDto } from '../models/dto/removeParticipamt.dto';
import { UpdateParticipantDto } from '../models/dto/updateParticipant.dto';
import { Team, TeamDocument } from '../models/schemas/team.schema';

@Injectable()
export class TeamService {
  constructor(
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
    private userService: UserService,
  ) {}

  getOneById(id: string): Observable<TeamDocument> {
    return from(this.teamModel.findById(id)).pipe(
      map((team) => {
        if (team) return team;
        else
          throw new HttpException('Команда не найдена', HttpStatus.NOT_FOUND);
      }),
    );
  }

  getManyByUser(userEntryDto: UserEntryDto): Observable<TeamDocument[]> {
    const filter = [];
    if (userEntryDto.login)
      filter.push({ 'participants.login': userEntryDto.login });
    if (userEntryDto.userId)
      filter.push({
        'participants.userId': new Types.ObjectId(userEntryDto.userId),
      });
    return from(
      this.teamModel.aggregate([
        { $unwind: '$participants' },
        {
          $match: {
            $or: filter,
          },
        },
      ]),
    );
  }

  createOne(createTeamDto: CreateTeamDto): Observable<TeamDocument> {
    return this.checkIfTeamTitleIsFree(createTeamDto.title).pipe(
      switchMap((check) => {
        if (check) {
          const newTeam = new this.teamModel(createTeamDto);
          return from(newTeam.save()).pipe(
            switchMap((team: TeamDocument) => {
              return this.addParticipant({
                userId: createTeamDto.creatorId,
                teamId: team._id,
                role: 0,
              }).pipe(
                map(() => {
                  return team;
                }),
              );
            }),
          );
        } else
          throw new HttpException(
            'Название команды уже занято',
            HttpStatus.NOT_FOUND,
          );
      }),
    );
  }

  updateOne(updateData: TeamDocument): Observable<boolean> {
    return from(
      this.teamModel.updateOne({ _id: updateData._id }, updateData),
    ).pipe(
      map((result: any) => {
        return result.modifiedCount ? true : false;
      }),
    );
  }

  checkIfTeamTitleIsFree(title: string): Observable<boolean> {
    return from(this.teamModel.findOne({ title })).pipe(
      map((team) => {
        if (team) return false;
        else return true;
      }),
    );
  }

  deleteOne(id: string): Observable<boolean> {
    return from(this.teamModel.deleteOne({ _id: id })).pipe(
      map((result: any) => {
        return result.deletedCount ? true : false;
      }),
    );
  }

  addParticipant(participantDto: AddParticipantDto): Observable<boolean> {
    return this.userService.findOne(participantDto).pipe(
      switchMap((user) => {
        return from(this.teamModel.findById(participantDto.teamId)).pipe(
          switchMap((team) => {
            if (
              team.participants.some(
                (participant) => participant.login === user.login,
              )
            )
              throw new HttpException(
                'Пользователь уже является участником команды',
                HttpStatus.NOT_FOUND,
              );
            else {
              team.participants.push({
                userId: user._id,
                login: user.login,
                role: participantDto.role,
              });
              return from(
                this.teamModel.updateOne(
                  { _id: team._id },
                  {
                    participants: team.participants,
                  },
                ),
              ).pipe(
                map((result: any) => {
                  return result.modifiedCount ? true : false;
                }),
              );
            }
          }),
        );
      }),
    );
  }

  removeParticipant(
    removeParticipantDto: RemoveParticipantDto,
  ): Observable<boolean> {
    return this.userService.findOne(removeParticipantDto).pipe(
      switchMap((user) => {
        return this.getOneById(removeParticipantDto.teamId).pipe(
          switchMap((team) => {
            if (
              team.participants.some(
                (participant) =>
                  participant.role === 0 && participant.login === user.login,
              )
            )
              throw new HttpException(
                'Нельзя удалить создателя команды',
                HttpStatus.NOT_FOUND,
              );
            if (
              team.participants.some(
                (participant) => participant.login === user.login,
              )
            ) {
              team.participants = team.participants.filter(
                (participant) => participant.login !== user.login,
              );
              return this.updateOne(team);
            } else
              throw new HttpException(
                'Пользователь не является участником команды',
                HttpStatus.NOT_FOUND,
              );
          }),
        );
      }),
    );
  }

  updateParticipant(
    updateParticipantDto: UpdateParticipantDto,
  ): Observable<boolean> {
    return this.userService.findOne(updateParticipantDto).pipe(
      switchMap((user) => {
        return this.getOneById(updateParticipantDto.teamId).pipe(
          switchMap((team) => {
            const updatedParticipant = team.participants.find(
              (participant) => participant.login === user.login,
            );
            if (updatedParticipant) {
              updatedParticipant.role = updateParticipantDto.role;
              return this.updateOne(team);
            } else
              throw new HttpException(
                'Пользователь не является участником команды',
                HttpStatus.NOT_FOUND,
              );
          }),
        );
      }),
    );
  }
  getAll() {
    return from(this.teamModel.find());
  }
}
