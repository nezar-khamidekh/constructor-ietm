import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as fs from 'fs';
import * as zipper from 'zip-local';
import {
  Repository,
  RepositoryDocument,
} from 'src/repository/models/schemas/repository.schema';
import { from, map } from 'rxjs';
import { join } from 'path';
import { RenameDto } from '../models/dto/rename.dto';
import { ObjectDto } from '../models/dto/object.dto';
import { FileDto } from '../models/dto/file.dto';
import { DirectoryDto } from '../models/dto/directory.dto';
import { MoveDto } from '../models/dto/move.dto';

enum SearchType {
  'files',
  'directories',
  'full',
}

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
    return this.scanRepo(repoId, SearchType.files);
  }

  getDirectoriesByRepoId(repoId: string) {
    return this.scanRepo(repoId, SearchType.directories);
  }

  getAllInRepoByRepoId(repoId: string) {
    return this.scanRepo(repoId, SearchType.full);
  }

  private scanRepo(repoId: string, searchFor: SearchType) {
    const repoPath = join('repositories', repoId.toString());
    let filenames: string[] = [];
    this.readDir(repoPath, filenames, searchFor);
    let paths = [];
    filenames.forEach((file: string) => {
      paths.push(file.slice(repoPath.length + 1));
    });
    return paths;
  }

  private readDir(path: string, filenames: string[], searchFor: SearchType) {
    fs.readdirSync(path, { withFileTypes: true }).forEach((file) => {
      let filepath = join(path, file.name);
      if (file.isFile()) {
        if (searchFor === SearchType.files || searchFor === SearchType.full) {
          filenames.push(filepath);
        }
      } else {
        if (
          searchFor === SearchType.directories ||
          searchFor === SearchType.full
        ) {
          filenames.push(filepath);
        }
        this.readDir(filepath, filenames, searchFor);
      }
    });
  }

  getRepoTreeInJSON(repoId: string) {
    const repoPath = join('repositories', repoId.toString());
    let repo = {};
    this.readDirJSON(repoPath, repo);
    return repo;
  }

  getStorageTreeInJSON() {
    const repoPath = 'repositories';
    let tree = { repositories: {} };
    let repo = {};
    this.readDirJSON(repoPath, repo);
    tree.repositories = repo;
    return tree;
  }

  private readDirJSON(path: string, dir) {
    let id = 0;
    fs.readdirSync(path, { withFileTypes: true }).forEach((file) => {
      if (file.isFile()) {
        dir[id++] = { filename: file.name };
      } else {
        dir[file.name] = {};
        this.readDirJSON(join(path, file.name), dir[file.name]);
      }
    });
  }

  checkIfExists(objectDto: ObjectDto) {
    const fullpath: string = join(
      process.cwd(),
      'repositories',
      objectDto.repoId,
      objectDto.path,
      objectDto.fullname,
    );
    return from(
      fs.promises
        .access(fullpath, fs.constants.F_OK)
        .then(() => true)
        .catch(() => false),
    );
  }

  createDirectory(dirDto: DirectoryDto) {
    const fullpath: string = this.joiner(
      dirDto.repoId,
      dirDto.path,
      dirDto.fullname,
    );
    return from(
      fs.promises
        .mkdir(fullpath, {
          recursive: true,
        })
        .then(() => true)
        .catch(() => false),
    );
  }

  renameObject(renameDto: RenameDto) {
    const oldPath: string = this.joiner(
      renameDto.repoId,
      renameDto.path,
      renameDto.fullname,
    );
    const newPath: string = this.joiner(
      renameDto.repoId,
      renameDto.path,
      renameDto.newName,
    );
    return this.rename(oldPath, newPath);
  }

  move(moveDto: MoveDto) {
    const oldPath: string = this.joiner(
      moveDto.repoId,
      moveDto.path,
      moveDto.fullname,
    );
    const newPath: string = this.joiner(
      moveDto.repoId,
      moveDto.newPath,
      moveDto.fullname,
    );
    return this.rename(oldPath, newPath);
  }

  saveFile(filename: string, fileDto: FileDto) {
    const oldPath: string = join(process.cwd(), 'buffer', filename);
    const newPath: string = this.joiner(
      fileDto.repoId,
      fileDto.path,
      fileDto.fullname,
    );
    return this.rename(oldPath, newPath);
  }

  zip(fileDto: FileDto) {
    const folderpath: string = this.joiner(
      fileDto.repoId,
      fileDto.path,
      fileDto.fullname,
    );
    return zipper.sync.zip(folderpath).compress().memory();
  }

  delete(objectDto: ObjectDto) {
    const fullpath: string = this.joiner(
      objectDto.repoId,
      objectDto.path,
      objectDto.fullname,
    );
    return this.checkIfExists(objectDto).pipe(
      map((result) => {
        if (result === true) {
          return fs.promises
            .rm(fullpath, { force: true, recursive: true })
            .then(() => true)
            .catch(() => false);
        } else {
          return false;
        }
      }),
    );
  }

  public joiner(repoId: string, subpath: string, fullname?: string): string {
    return join(process.cwd(), 'repositories', repoId, subpath, fullname ?? '');
  }

  private rename(oldPath: string, newPath: string) {
    return from(
      fs.promises
        .rename(oldPath, newPath)
        .then(() => true)
        .catch(() => false),
    );
  }
}
