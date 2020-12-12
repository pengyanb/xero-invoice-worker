import express from "express";
import invoicesRoute from "./routes/invoices.route";

const debug = require("debug")("mock:mockDataServer");


const startMockDataServer = (port: number) => {
  const mockDataServer = express();
  mockDataServer.use("/invoices", invoicesRoute);

  mockDataServer.listen(port, () => {
    debug(`server start at port: ${port}`);
  })
};

export default startMockDataServer;