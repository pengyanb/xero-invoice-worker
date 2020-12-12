import express from "express";
import bodyParser from "body-parser";
import minimist from "minimist";

import getServerConfig from "./serverconfig";
import { startCronjob } from "./cronjob";
import startMockDataServer from "../mock/mockDataServer";

const debug = require("debug")("server:index");
const argv = minimist(process.argv.slice(2));
debug("[argv]: ", argv);
const serverConfig = getServerConfig(argv);

const server = express();
server.use(bodyParser.json());

server.listen(serverConfig.port, () => {
  debug(`server start at port: ${serverConfig.port}`);
});

if (serverConfig.useLocalMockServer) {
  startMockDataServer(serverConfig.mockServerPort);
}

startCronjob(serverConfig);


