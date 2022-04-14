import express, { Express, Request, Response } from 'express';
import { loadGLTF } from './parser.js';
import dotenv from 'dotenv';
dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.get('/model/:path', function (req: Request, res: Response) {
  let path = '/models/' + req.params.path + '.gltf';
  let model = loadGLTF(path);
  res.json(model);
});

app.listen(port, () => {
  console.log(`[server]: Server is running at https://localhost:${port}`);
});
