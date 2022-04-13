import express from 'express';
import { loadGLTF } from './parser.js';

const app = express();

app.get('/', function (req, res) {
  res.send('Hello World');
});

app.get('/model/:path', function (req, res) {
  let path = '/models/' + req.params.path + '.gltf';
  let model = loadGLTF(path);
  res.json(model);
});

app.listen(3000);
