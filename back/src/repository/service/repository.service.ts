import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  Repository,
  RepositoryDocument,
  RepositoryType,
} from '../models/schemas/repository.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { TeamService } from 'src/team/service/team.service';
import { CreateRepositoryDto } from '../models/dto/createRepository.dto';
import { from, map, Observable, of, switchMap } from 'rxjs';
import { UserService } from 'src/user/service/user.service';
import { AddParticipantDto } from 'src/team/models/dto/addParticipant.dto';
import { RemoveParticipantDto } from 'src/team/models/dto/removeParticipant.dto';
import { UpdateParticipantDto } from 'src/team/models/dto/updateParticipant.dto';
import { ParticipantRole } from 'src/team/models/schemas/participant.schema';
import { UserDocument } from 'src/user/models/schemas/user.schema';
import { ModelService } from 'src/model-manager/service/model.service';
import { extname, join } from 'path';
import { RemoveModelDto } from '../models/dto/removeModel.dto';
import { TakeModelDto } from '../models/dto/takeModel.dto';
import { ModelFormat, RegisterModelDto } from '../models/dto/registerModel.dto';
import { Favorite, FavoriteDocument } from '../models/schemas/favorite.schema';
import { AddToFavoriteDto } from '../models/dto/addToFavorite.dto';
import { RemoveFromFavoriteDto } from '../models/dto/removeFromFavorite.dto';
import { CheckRepoInFavoriteDto } from '../models/dto/checkRepoInFavorite.dto';
import { FindRepositoryDto } from '../models/dto/findRepository.dto';

const TEAM_POPULATE_DATA = {
  path: 'team',
  select: ['title', 'avatar', 'description', 'participants'],
  populate: {
    path: 'participants.user',
    select: ['avatar', 'lastName', 'firstName', 'email', 'login'],
  },
};
const USER_POPULATE_FIELDS_LIST = [
  'avatar',
  'lastName',
  'firstName',
  'email',
  'login',
];

@Injectable()
export class RepositoryService {
  constructor(
    @InjectModel(Repository.name)
    private repositoryModel: Model<RepositoryDocument>,
    @InjectModel(Favorite.name)
    private favoriteModel: Model<FavoriteDocument>,
    private teamService: TeamService,
    private userService: UserService,
    private modelService: ModelService,
  ) {}

  create(createRepositoryDto: CreateRepositoryDto) {
    return this.checkIfRepoTitleExits(createRepositoryDto.title).pipe(
      switchMap((check) => {
        if (!check) {
          if (createRepositoryDto.team) {
            return this.teamService
              .checkIfTeamHasUser({
                teamId: createRepositoryDto.team,
                userId: createRepositoryDto.author,
              })
              .pipe(
                switchMap((checkResult: boolean) => {
                  if (checkResult) {
                    const newRepo = new this.repositoryModel(
                      createRepositoryDto,
                    );
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
        } else
          throw new HttpException(
            'Название репозитория занято',
            HttpStatus.CONFLICT,
          );
      }),
    );
  }

  checkIfRepoTitleExits(title: string) {
    return from(this.repositoryModel.findOne({ title: title })).pipe(
      map((repo) => {
        return repo ? true : false;
      }),
    );
  }

  getOneById(id: string) {
    return from(
      this.repositoryModel
        .findById(id)
        .populate(TEAM_POPULATE_DATA)
        .populate('author', USER_POPULATE_FIELDS_LIST)
        .populate('participants.user', USER_POPULATE_FIELDS_LIST),
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
        .sort([['updatedAt', -1]])
        .populate(TEAM_POPULATE_DATA)
        .populate('author', USER_POPULATE_FIELDS_LIST)
        .populate('participants.user', USER_POPULATE_FIELDS_LIST),
    );
  }

  getAllPublic() {
    return from(
      this.repositoryModel
        .find({ type: RepositoryType.Public })
        .sort([['updatedAt', -1]])
        .populate(TEAM_POPULATE_DATA)
        .populate('author', USER_POPULATE_FIELDS_LIST)
        .populate('participants.user', USER_POPULATE_FIELDS_LIST),
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
        .sort([['updatedAt', -1]])
        .populate('author', USER_POPULATE_FIELDS_LIST)
        .populate('participants.user', USER_POPULATE_FIELDS_LIST),
    ).pipe(
      map((repos) => {
        return repos;
      }),
    );
  }

  getTeamRepos(teamId: string, userId: string): Observable<any> {
    return from(
      this.repositoryModel
        .find({ team: teamId })
        .sort([['updatedAt', -1]])
        .populate(TEAM_POPULATE_DATA)
        .populate('author', USER_POPULATE_FIELDS_LIST),
    ).pipe(
      map((repos: any[]) => {
        return repos.filter(
          (repo) =>
            repo.team?.participants.some(
              (participant) => participant.user._id.toString() === userId,
            ) || repo.type === RepositoryType.Public,
        );
      }),
    );
  }

  getPublicTeamRepos(teamId: string): Observable<any> {
    return from(
      this.repositoryModel
        .find({ team: teamId, type: RepositoryType.Public })
        .sort([['updatedAt', -1]])
        .populate(TEAM_POPULATE_DATA)
        .populate('author', USER_POPULATE_FIELDS_LIST),
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
      switchMap((result: any) => {
        if (result.deletedCount)
          return from(this.favoriteModel.deleteMany({ repository: id })).pipe(
            map((res: any) => {
              return res.deletedCount ? true : false;
            }),
          );
        else return of(false);
      }),
    );
  }

  deleteAll(): Observable<boolean> {
    return from(this.repositoryModel.deleteMany()).pipe(
      switchMap((result: any) => {
        if (result.deletedCount)
          return from(this.favoriteModel.deleteMany()).pipe(
            map((res: any) => {
              return res.deletedCount ? true : false;
            }),
          );
        else return of(false);
      }),
    );
  }

  getAllFavoriteTickets() {
    return from(this.favoriteModel.find());
  }

  registerModel(file: Express.Multer.File, registerModelDto: RegisterModelDto) {
    return this.getOneById(registerModelDto.repoId).pipe(
      switchMap((repo) => {
        return this.modelService.checkIfRepoDirectoryExists(repo._id).pipe(
          switchMap((check) => {
            if (check)
              return this.modelService
                .writeModelDirectoryById(
                  repo._id,
                  file.filename.replace(extname(file.filename), ''),
                )
                .pipe(
                  switchMap(() => {
                    return this.saveModel(
                      file,
                      repo,
                      Number(registerModelDto.format),
                      Number(registerModelDto.type),
                    );
                  }),
                );
            else
              return this.modelService.writeRepoDirectoryById(repo._id).pipe(
                switchMap(() => {
                  return this.modelService
                    .writeModelDirectoryById(
                      repo._id,
                      file.filename.replace(extname(file.filename), ''),
                    )
                    .pipe(
                      switchMap(() => {
                        return this.saveModel(
                          file,
                          repo,
                          Number(registerModelDto.format),
                          Number(registerModelDto.type),
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

  private saveModel(
    file: any,
    repo: RepositoryDocument,
    format: number,
    type: number,
  ) {
    const fileId: string = file.filename.replace(extname(file.filename), '');
    const modelPath = join(
      process.cwd(),
      'repositories',
      repo._id.toString(),
      fileId,
      file.filename.replace(extname(file.filename), '.gltf'),
    );
    const straightPath = join(
      process.cwd(),
      'repositories',
      repo._id.toString(),
      fileId,
      file.originalname,
    );
    switch (format) {
      case ModelFormat.gltf:
        return this.modelService
          .saveModel(join(process.cwd(), file.path), straightPath)
          .pipe(
            switchMap(() => {
              return this.modelService
                .saveCompressedModel(straightPath, modelPath)
                .pipe(
                  switchMap(() => {
                    repo.models.push({
                      name: file.originalname.slice(
                        0,
                        file.originalname.lastIndexOf('.'),
                      ),
                      filename: file.originalname,
                      path: fileId,
                      type: type,
                    });
                    return from(
                      this.updateOne({ _id: repo._id, models: repo.models }),
                    ).pipe(
                      switchMap(() => {
                        return this.getOneById(repo._id);
                      }),
                    );
                  }),
                );
            }),
          );
      case ModelFormat.step:
        return this.modelService
          .convertModelAndSave(
            join(process.cwd(), file.path),
            modelPath,
            straightPath,
            10,
          )
          .pipe(
            switchMap(() => {
              repo.models.push({
                name: file.originalname.slice(
                  0,
                  file.originalname.lastIndexOf('.'),
                ),
                filename: file.originalname,
                path: fileId,
                type: type,
              });
              return from(
                this.updateOne({ _id: repo._id, models: repo.models }),
              ).pipe(
                switchMap(() => {
                  return this.getOneById(repo._id);
                }),
              );
            }),
          );
    }
  }

  removeModel(removeModelDto: RemoveModelDto) {
    return this.getOneById(removeModelDto.repoId).pipe(
      switchMap((repo) => {
        const filteredModels = repo.models.filter(
          (model: any) => model._id.toString() !== removeModelDto.modelId,
        );
        return this.updateOne({ _id: repo._id, models: filteredModels }).pipe(
          switchMap(() => {
            const fileDirectory = repo.models.find(
              (model: any) => model._id.toString() === removeModelDto.modelId,
            ).path;
            const modelDirectoryPath = join(
              'repositories',
              repo._id.toString(),
              fileDirectory,
            );
            return this.modelService.deleteModel(modelDirectoryPath);
          }),
        );
      }),
    );
  }

  takeModel(takeModelDto: TakeModelDto) {
    return this.getOneById(takeModelDto.repoId).pipe(
      map((repo) => {
        return repo.models.find(
          (model: any) => model._id.toString() === takeModelDto.modelId,
        );
      }),
    );
  }

  addRepoToFavorite(addToFavoriteDto: AddToFavoriteDto) {
    return from(
      this.favoriteModel.findOne({
        user: addToFavoriteDto.userId,
        repository: addToFavoriteDto.repoId,
      }),
    ).pipe(
      switchMap((ticket) => {
        if (ticket)
          throw new HttpException(
            'Этот репозиторий уже добавлен в избранное',
            HttpStatus.NOT_ACCEPTABLE,
          );
        else {
          const newFavorite = new this.favoriteModel({
            user: addToFavoriteDto.userId,
            repository: addToFavoriteDto.repoId,
          });
          return from(newFavorite.save()).pipe(
            map((ticket) => {
              return ticket ? true : false;
            }),
          );
        }
      }),
    );
  }

  checkFavorite(checkRepoInFavoriteDto: CheckRepoInFavoriteDto) {
    return from(
      this.favoriteModel.findOne({
        user: checkRepoInFavoriteDto.userId,
        repository: checkRepoInFavoriteDto.repoId,
      }),
    ).pipe(
      map((ticket) => {
        return ticket ? true : false;
      }),
    );
  }

  getUserFavoriteReps(userId: string) {
    return from(
      this.favoriteModel.find({ user: userId }).populate({
        path: 'repository',
        select: [
          'title',
          'author',
          'type',
          'description',
          'preview',
          'createdAt',
          'updatedAt',
        ],
        populate: {
          path: 'author',
          select: USER_POPULATE_FIELDS_LIST,
        },
      }),
    );
  }

  removeRepoFromFavorite(removeFromFavoriteDto: RemoveFromFavoriteDto) {
    return from(
      this.favoriteModel.deleteOne({
        user: removeFromFavoriteDto.userId,
        repository: removeFromFavoriteDto.repoId,
      }),
    ).pipe(
      map((result: any) => {
        return result.deletedCount ? true : false;
      }),
    );
  }

  searchRepositoryByQuery(findRepositoryDto: FindRepositoryDto) {
    return from(
      this.repositoryModel
        .find({
          $or: [
            {
              description: {
                $regex: findRepositoryDto.queryStr,
                $options: 'i',
              },
            },
            { title: { $regex: findRepositoryDto.queryStr, $options: 'i' } },
          ],
          type: RepositoryType.Public,
        })
        .populate(TEAM_POPULATE_DATA)
        .populate('author', USER_POPULATE_FIELDS_LIST)
        .populate('participants.user', USER_POPULATE_FIELDS_LIST),
    );
  }
}
