import { ViteDevServer } from 'vite'

export const devPlugin = () => {
  return {
    name: 'dev-plugin',
    configureServer: (server: ViteDevServer) => {
      require("esbuild").buildSync({
        entryPoints: ["./src/main/mainEntry.ts"],
        bundle: true,
        platform: "node",
        outfile: "./dist/mainEntry.js",
        external: ["electron"],
      });

      server.httpServer?.once("listening", () => {
        let { spawn } = require("child_process");
        let addressInfo = server.httpServer?.address() as any;
        let httpAddress = `http://localhost:${addressInfo.port}`;
        let electronProcess = spawn(require("electron").toString(), [
          "./dist/mainEntry.js",
          httpAddress,
        ],
          {
            stdio: "inherit",
            cwd: process.cwd(),
          });

        electronProcess.on("close", () => {
          server.close();
          process.exit();
        });
      });
    }
  };
}

export const getReplacer = () => {
  const externalModels = ["os", "fs", "path", "events", "child_process", "crypto", "http", "buffer", "url", "better-sqlite3", "knex"];
  const result = {};
  for (let item of externalModels) {
    result[item] = () => ({
      find: new RegExp(`^${item}$`),
      code: `const ${item} = require('${item}');export { ${item} as default }`,
    });
  }
  result["electron"] = () => {
    const electronModules = ["clipboard", "ipcRenderer", "nativeImage", "shell", "webFrame"].join(",");
    return {
      find: new RegExp(`^electron$`),
      code: `const {${electronModules}} = require('electron');export {${electronModules}}`,
    };
  };
  return result;
}