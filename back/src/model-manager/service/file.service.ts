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

@Injectable()
export class FileService {
  constructor(
    @InjectModel(Repository.name)
    private repositoryModel: Model<RepositoryDocument>,
  ) {}

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
    let filenames: string[] = [];
    this.readDir(repoPath, filenames);
    let paths = [];
    filenames.forEach((file: string) => {
      paths.push(file.slice(repoPath.length + 1));
    });
    return paths;
  }

  private readDir(path: string, filenames: string[]) {
    fs.readdirSync(path, { withFileTypes: true }).forEach((file) => {
      let filepath = join(path, file.name);
      if (file.isFile()) {
        filenames.push(filepath);
      } else {
        this.readDir(filepath, filenames);
      }
    });
  }

  checkIfExists(fullpath: string) {
    return from(
      fs.promises
        .access(fullpath, fs.constants.F_OK)
        .then(() => true)
        .catch(() => false),
    );
  }

  createDirectory(fullpath: string) {
    return from(
      fs.promises
        .mkdir(fullpath, {
          recursive: true,
        })
        .then(() => true)
        .catch(() => false),
    );
  }

  saveFile(inputPath: string, outputPath: string) {
    return from(
      fs.promises
        .rename(inputPath, outputPath)
        .then(() => true)
        .catch(() => false),
    );
  }

  deleteFileOrDirectory(fullpath: string) {
    return from(
      fs.promises
        .rm(fullpath.toString(), { force: true, recursive: true })
        .then(() => true)
        .catch(() => false),
    );
  }
}
