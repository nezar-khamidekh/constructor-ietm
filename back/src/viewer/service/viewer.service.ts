import { Injectable } from '@nestjs/common';
import * as nrc from 'node-run-cmd';

@Injectable()
export class ViewerService {
  converterPath = 'C:\\Program Files\\gltf-converter';

  convertModel(inputPath: string, outputPath: string) {
    nrc
      .run([
        `cd ${this.converterPath}`,
        `gltf-converter ${inputPath} ${outputPath}`,
      ])
      .then(
        function (exitCodes) {
          //console.log(exitCodes);
        },
        function (err) {
          console.log('Convertation failed, error: ', err);
        },
      );
  }
}
