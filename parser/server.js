import {
  DRACOLoader,
  GLTFLoader,
  loadGltf,
  TextureLoader,
} from "node-three-gltf";
import express from "express";
import dotenv from "dotenv";
import { join } from "path";
dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

app.get("/model/:path", function (req, res) {
  let path = join("./models/", req.params.path + ".gltf");
  const loader = new GLTFLoader();
  loader.setDRACOLoader(new DRACOLoader());

  loader.load(path, (file) => {
    loader.parse(JSON.stringify(file.parser.json), "", (gltf) => {
      console.log(gltf);
    });
  });
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
