import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  Repository,
  RepositoryDocument,
} from '../models/schemas/repository.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { TeamService } from 'src/team/service/team.service';
import { CreateRepositoryDto } from '../models/dto/createRepository.dto';
import { from, map, Observable, switchMap } from 'rxjs';
import { UserService } from 'src/user/service/user.service';
import { AddParticipantDto } from 'src/team/models/dto/addParticipant.dto';
import { RemoveParticipantDto } from 'src/team/models/dto/removeParticipamt.dto';
import { UpdateParticipantDto } from 'src/team/models/dto/updateParticipant.dto';
import { ParticipantRole } from 'src/team/models/schemas/participant.schema';
import { UserDocument } from 'src/user/models/schemas/user.schema';
import { ViewerService } from 'src/viewer/service/viewer.service';
import { extname } from 'path';
import { RemoveModelDto } from '../models/dto/removeModel.dto';
import { TakeModelDto } from '../models/dto/takeModel.dto';

@Injectable()
export class RepositoryService {
  constructor(
    @InjectModel(Repository.name)
    private repositoryModel: Model<RepositoryDocument>,
    private teamService: TeamService,
    private userService: UserService,
    private viewerService: ViewerService,
  ) {}

  create(createRepositoryDto: CreateRepositoryDto) {
    if (createRepositoryDto.team) {
      return this.teamService
        .checkIfTeamHasUser({
          teamId: createRepositoryDto.team,
          userId: createRepositoryDto.author,
        })
        .pipe(
          switchMap((checkResult: boolean) => {
            if (checkResult) {
              const newRepo = new this.repositoryModel(createRepositoryDto);
              return from(newRepo.save()).pipe(
                map((repo) => {
                  return repo;
                }),
              );
            }
          }),
        );
    } else {
      const newRepo = new this.repositoryModel(createRepositoryDto);
      return from(newRepo.save()).pipe(
        switchMap((repo) => {
          return this.addParticipant({
            repoId: repo._id,
            role: ParticipantRole.Author,
            userId: createRepositoryDto.author,
          }).pipe(
            map((result) => {
              return repo;
            }),
          );
        }),
      );
    }
  }

  getOneById(id: string) {
    return from(
      this.repositoryModel
        .findById(id)
        .populate({
          path: 'team',
          select: ['title', 'avatar', 'description', 'participants'],
          populate: {
            path: 'participants.user',
            select: ['avatar', 'lastName', 'firstName', 'email', 'login'],
          },
        })
        .populate('author', [
          'avatar',
          'lastName',
          'firstName',
          'email',
          'login',
        ])
        .populate('participants.user', [
          'avatar',
          'lastName',
          'firstName',
          'email',
          'login',
        ]),
    ).pipe(
      map((repo) => {
        if (repo) return repo;
        else
          throw new HttpException(
            'Репозиторий не найден',
            HttpStatus.NOT_FOUND,
          );
      }),
    );
  }

  getAll() {
    return from(
      this.repositoryModel
        .find()
        .populate({
          path: 'team',
          select: ['title', 'avatar', 'description', 'participants'],
          populate: {
            path: 'participants.user',
            select: ['avatar', 'lastName', 'firstName', 'email', 'login'],
          },
        })
        .populate('author', [
          'avatar',
          'lastName',
          'firstName',
          'email',
          'login',
        ])
        .populate('participants.user', [
          'avatar',
          'lastName',
          'firstName',
          'email',
          'login',
        ]),
    );
  }

  getUserRepos(userId: string): Observable<any> {
    return from(
      this.repositoryModel
        .find({
          $or: [
            { author: new Types.ObjectId(userId) },
            { 'participants.user': new Types.ObjectId(userId) },
          ],
          team: null,
        })
        .populate('author', [
          'avatar',
          'lastName',
          'firstName',
          'email',
          'login',
        ])
        .populate('participants.user', [
          'avatar',
          'lastName',
          'firstName',
          'email',
          'login',
        ]),
    ).pipe(
      map((repos) => {
        return repos;
      }),
    );
  }

  getTeamRepos(teamId: string): Observable<any> {
    return from(
      this.repositoryModel
        .find({ team: teamId })
        .populate({
          path: 'team',
          select: ['title', 'avatar', 'description', 'participants'],
          populate: {
            path: 'participants.user',
            select: ['avatar', 'lastName', 'firstName', 'email', 'login'],
          },
        })
        .populate('author', [
          'avatar',
          'lastName',
          'firstName',
          'email',
          'login',
        ]),
    );
  }

  updateOne(updateData: any) {
    return from(
      this.repositoryModel.updateOne({ _id: updateData._id }, updateData),
    ).pipe(
      map((result: any) => {
        return result.modifiedCount ? true : false;
      }),
    );
  }

  addParticipant(
    participantDto: AddParticipantDto,
  ): Observable<UserDocument | boolean> {
    return this.userService.findOne(participantDto).pipe(
      switchMap((user) => {
        return from(this.repositoryModel.findById(participantDto.repoId)).pipe(
          switchMap((repo) => {
            if (
              repo.participants.some(
                (participant) => participant.login === user.login,
              )
            )
              throw new HttpException(
                'Пользователь уже является участником репозитория',
                HttpStatus.NOT_FOUND,
              );
            else {
              repo.participants.push({
                user: user._id,
                login: user.login,
                role: participantDto.role,
              });
              return this.updateOne(repo).pipe(
                map((result: any) => {
                  return result.modifiedCount ? user : false;
                }),
              );
            }
          }),
        );
      }),
    );
  }

  removeParticipant(removeParticipantDto: RemoveParticipantDto) {
    return this.userService.findOne(removeParticipantDto).pipe(
      switchMap((user) => {
        return this.getOneById(removeParticipantDto.repoId).pipe(
          switchMap((repo) => {
            if (repo.author === user._id)
              throw new HttpException(
                'Нельзя удалить создателя репозитория',
                HttpStatus.NOT_FOUND,
              );
            if (
              repo.participants.some(
                (participant) => participant.login === user.login,
              )
            ) {
              repo.participants = repo.participants.filter(
                (participant) => participant.login !== user.login,
              );
              return this.updateOne(repo);
            } else
              throw new HttpException(
                'Пользователь не является участником репозитория',
                HttpStatus.NOT_FOUND,
              );
          }),
        );
      }),
    );
  }

  updateParticipant(updateParticipantDto: UpdateParticipantDto) {
    return this.userService.findOne(updateParticipantDto).pipe(
      switchMap((user) => {
        return this.getOneById(updateParticipantDto.repoId).pipe(
          switchMap((repo) => {
            const updatedParticipant = repo.participants.find(
              (participant) => participant.login === user.login,
            );
            if (updatedParticipant) {
              updatedParticipant.role = updateParticipantDto.role;
              return this.updateOne(repo);
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

  deleteOne(id: string): Observable<boolean> {
    return from(this.repositoryModel.deleteOne({ _id: id })).pipe(
      map((result: any) => {
        return result.deletedCount ? true : false;
      }),
    );
  }

  reisterModel(file: Express.Multer.File, repoId: string) {
    return this.getOneById(repoId).pipe(
      switchMap((repo) => {
        return this.viewerService.checkIfRepoDirectoryExists(repo._id).pipe(
          switchMap((check) => {
            if (check)
              return this.viewerService
                .convertModelAndSave(
                  process.cwd() + '\\' + file.path,
                  process.cwd() +
                    '\\repositories\\' +
                    repo._id +
                    '\\' +
                    file.filename.replace(extname(file.filename), '.gltf'),
                )
                .pipe(
                  switchMap(() => {
                    repo.models.push({
                      name: file.originalname.slice(
                        0,
                        file.originalname.lastIndexOf('.'),
                      ),
                      filename: file.originalname,
                      path: file.filename.replace(
                        extname(file.filename),
                        '.gltf',
                      ),
                    });
                    return from(
                      this.updateOne({ _id: repo._id, models: repo.models }),
                    ).pipe(
                      map((result) => {
                        return repo;
                      }),
                    );
                  }),
                );
            else
              return this.viewerService.writeRepoDirectoryById(repo._id).pipe(
                switchMap(() => {
                  return this.viewerService
                    .convertModelAndSave(
                      process.cwd() + '\\' + file.path,
                      process.cwd() +
                        '\\repositories\\' +
                        repo._id +
                        '\\' +
                        file.filename.replace(extname(file.filename), '.gltf'),
                    )
                    .pipe(
                      switchMap(() => {
                        repo.models.push({
                          name: file.originalname.slice(
                            0,
                            file.originalname.lastIndexOf('.'),
                          ),
                          filename: file.originalname,
                          path: file.filename.replace(
                            extname(file.filename),
                            '.gltf',
                          ),
                        });
                        return from(
                          this.updateOne({
                            _id: repo._id,
                            models: repo.models,
                          }),
                        ).pipe(
                          map((result) => {
                            return repo;
                          }),
                        );
                      }),
                    );
                }),
              );
          }),
        );
      }),
    );
  }

  removeModel(removeModelDto: RemoveModelDto) {
    return this.getOneById(removeModelDto.repoId).pipe(
      switchMap((repo) => {
        const filteredModels = repo.models.filter(
          (model) => model.filename !== removeModelDto.filename,
        );
        return this.updateOne({ _id: repo._id, models: filteredModels }).pipe(
          switchMap((result) => {
            const modelPath =
              './repositories/' +
              repo._id +
              '/' +
              repo.models.filter(
                (model) => model.filename === removeModelDto.filename,
              )[0].path;
            return this.viewerService.checkIfModelExists(modelPath).pipe(
              switchMap((check) => {
                return this.viewerService.deleteModel(modelPath);
              }),
            );
          }),
        );
      }),
    );
  }

  takeModel(takeModelDto: TakeModelDto) {
    return this.getOneById(takeModelDto.repoId).pipe(
      map((repo) => {
        return repo.models.filter(
          (model) => model.filename === takeModelDto.filename,
        )[0];
      }),
    );
  }
}
