import { Injectable } from '@nestjs/common';
import * as nrc from 'node-run-cmd';
import * as fs from 'fs';
import { from } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ViewerService {
  CONVERTER_PATH: string;

  constructor(private configService: ConfigService) {
    this.CONVERTER_PATH = this.configService.get('CONVERTER_PATH');
  }

  convertModelAndSave(inputPath: string, outputPath: string) {
    return from(
      nrc.run([`gltf-converter ${inputPath} ${outputPath}`], {
        cwd: this.CONVERTER_PATH,
      }),
    );
  }

  checkIfModelExists(modelPath: string) {
    return from(
      fs.promises
        .access(modelPath, fs.constants.F_OK)
        .then(() => true)
        .catch(() => false),
    );
  }

  checkIfRepoDirectoryExists(repoId: string) {
    return from(
      fs.promises
        .access('./repositories/' + repoId, fs.constants.F_OK)
        .then(() => true)
        .catch(() => false),
    );
  }

  writeRepoDirectoryById(repoId: string) {
    return from(fs.mkdirSync('./repositories/' + repoId, { recursive: true }));
  }

  deleteModel(path: string) {
    return from(
      fs.promises
        .unlink(path)
        .then(() => true)
        .catch(() => false),
    );
  }
}
