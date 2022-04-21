import express, { Express, Request, Response } from 'express';
import { DRACOLoader, GLTFLoader, GLTF } from 'node-three-gltf';
import dotenv from 'dotenv';
import { join } from 'path';
dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.get('/model/:path', function (req: Request, res: Response) {
  let path = join('./models/', req.params.path + '.gltf');

  const loader = new GLTFLoader();
  loader.setDRACOLoader(new DRACOLoader());

  loader.load(path, (file: GLTF) => {
    res.send(JSON.stringify(file.parser.json));
  });
});

app.listen(port, () => {
  console.log(`[server]: Server is running at https://localhost:${port}`);
});
