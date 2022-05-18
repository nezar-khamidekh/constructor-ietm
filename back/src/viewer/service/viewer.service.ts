import { Injectable } from '@nestjs/common';
import * as nrc from 'node-run-cmd';
import * as fs from 'fs';
import { from, map, of } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ViewerService {
  CONVERTER_PATH: string;

  constructor(private configService: ConfigService) {
    this.CONVERTER_PATH = this.configService.get('CONVERTER_PATH');
  }

  convertModelAndSave(
    inputPath: string,
    outputPath: string,
    straightPath: string,
    compression: number,
  ) {
    return from(
      nrc.run(
        [
          `gltf-converter ${inputPath} ${outputPath} --draco --speed=${
            10 - compression
          }`,
        ],
        {
          cwd: this.CONVERTER_PATH,
        },
      ),
    ).pipe(
      map(() => {
        return this.saveModel(inputPath, straightPath);
      }),
    );
  }

  saveModel(inputPath: string, outputPath: string) {
    return from(
      fs.promises
        .rename(inputPath, outputPath)
        .then(() => true)
        .catch(() => false),
    );
  }

  saveCompressedModel(originalPath, outputPath: string) {
    const gltfPipeline = require('gltf-pipeline');
    const fsExtra = require('fs-extra');
    const processGltf = gltfPipeline.processGltf;
    const gltf = fsExtra.readJsonSync(originalPath);
    const options = {
      dracoOptions: {
        compressionLevel: 10,
      },
    };
    gltf.nodes.forEach((node) => {
      node.extras = { local_id: uuidv4() };
    });
    return from(processGltf(gltf, options)).pipe(
      map((results: any) => {
        fsExtra.writeJsonSync(outputPath, results.gltf);
        return true;
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
    return from(
      fs.promises
        .mkdir('./repositories/' + repoId, { recursive: true })
        .then(() => true)
        .catch(() => false),
    );
  }

  writeModelDirectoryById(repoId: string, modelId: string) {
    return from(
      fs.promises
        .mkdir('./repositories/' + repoId + '/' + modelId, { recursive: true })
        .then(() => true)
        .catch(() => false),
    );
  }

  deleteModel(path: string) {
    return from(
      fs.promises
        .rm(path, { force: true, recursive: true })
        .then(() => true)
        .catch(() => false),
    );
  }
}
