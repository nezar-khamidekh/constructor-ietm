import { Injectable } from '@nestjs/common';
import * as nrc from 'node-run-cmd';
import * as fs from 'fs';
import { from } from 'rxjs';

@Injectable()
export class ViewerService {
  converterPath = 'C:\\gltf-conventer';

  convertModelAndSave(inputPath: string, outputPath: string) {
    return from(
      nrc.run([`gltf-converter ${inputPath} ${outputPath}`], {
        cwd: this.converterPath,
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
