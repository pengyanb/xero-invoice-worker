import path from "path";

export interface IServerConfig {
  port: number;
  useLocalMockServer: boolean;
  mockServerPort: number;
  feedUrl: string;
  invoiceDir: string;
  fetchFrequence: string;
  pageSize: number;
  afterEventId: number;
}

interface IUserConfig {
  [key: string]: any;
}

const getServerConfig: (config: IUserConfig) => IServerConfig = (config: IUserConfig) => ({
  "port": config.port || 9000,
  useLocalMockServer: config.useLocalMockServer || true,
  "mockServerPort": config.mockServerPort || 9001,
  "feedUrl": config.feedUrl || config["feed-url"] || `http://localhost:${config.mockServerPort || 9001}/invoices/events`,
  "invoiceDir": config.invoiceDir || config["invoice-dir"] || path.resolve(__dirname, "../invoiceDir"),
  "fetchFrequence": config.fetchFrequence || "10 * * * * *",
  "pageSize": config.pageSize || 10,
  "afterEventId": 0
});

export default getServerConfig;