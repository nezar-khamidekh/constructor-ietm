import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as fs from 'fs';
import {
  Repository,
  RepositoryDocument,
} from 'src/repository/models/schemas/repository.schema';
import { from, map } from 'rxjs';
import { join } from 'path';
import { ObjectDto } from '../models/dto/checkIfExists.dto';

@Injectable()
export class FileService {
  constructor(
    @InjectModel(Repository.name)
    private repositoryModel: Model<RepositoryDocument>,
  ) { }

  getRepoById(repoId: string) {
    return from(this.repositoryModel.findById(repoId)).pipe(
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

  getFilesByRepoId(repoId: string) {
    const repoPath = join('repositories', repoId.toString());
    let filenames = [];
    this.readDir(repoPath, filenames);
    let paths = [];
    filenames.forEach((file: string) => {
      paths.push(file.slice(repoPath.length + 1));
    });
    return paths;
  }

  readDir(path: string, filenames: any[]) {
    fs.readdirSync(path, { withFileTypes: true }).forEach((file) => {
      let filepath = join(path, file.name);
      if (file.isFile()) {
        filenames.push(filepath);
      } else {
        this.readDir(filepath, filenames);
      }
    });
    return filenames;
  }

  checkIfExists(repoId: string, object: ObjectDto): boolean {
    const fullpath: string = join(process.cwd(), 'repositories', repoId, object.path, object.fullname);
    return fs.existsSync(fullpath) ? true : false;
  }
}
