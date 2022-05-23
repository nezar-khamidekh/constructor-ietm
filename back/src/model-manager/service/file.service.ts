import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as fs from 'fs';
import { Repository, RepositoryDocument } from 'src/repository/models/schemas/repository.schema';
import { from, map } from 'rxjs';
import { join } from 'path';

@Injectable()
export class FileService {
  constructor(@InjectModel(Repository.name)
  private repositoryModel: Model<RepositoryDocument>) { }

  getRepoById(repoId: string) {
    return from(
      this.repositoryModel
        .findById(repoId)
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

  getFilesByRepoId(repoId: string) {
    const repoPath = join(process.cwd(), 'repositories', repoId.toString());
    let filenames = [];
    this.readDir(repoPath, filenames);
    return filenames;
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


}
