import {
  DRACOLoader,
  GLTFLoader,
  loadGltf,
  TextureLoader,
} from 'node-three-gltf';
import express from 'express';
import dotenv from 'dotenv';
import { join } from 'path';
dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

app.get('/model/:path', function (req, res) {
  let path = join('./models/', req.params.path + '.gltf');
  const loader = new GLTFLoader();
  loader.setDRACOLoader(new DRACOLoader());

  loader.load(path, (file) => {
    loader.parse(JSON.stringify(file.parser.json), '', (gltf) => {
      res.send(JSON.stringify(gltf, getCircularReplacer()));
    });
  });
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};
