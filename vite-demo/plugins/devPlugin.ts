import { ViteDevServer } from 'vite'

import path from 'path';
import fs from 'fs';

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
  const result: { [key: string]: any } = {}; // add index signature
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

class BuildObj {
  buildMain() {
    require("esbuild").buildSync({
      entryPoints: ["./src/main/mainEntry.ts"],
      bundle: true,
      platform: "node",
      outfile: "./dist/mainEntry.js",
      external: ["electron"],
    });
  }

  preparePackageJson() {
    const packJsonPath = path.join(process.cwd(), "package.json");
    const localPkgJson = JSON.parse(fs.readFileSync(packJsonPath, "utf-8"));
    const electronConfig = localPkgJson.devDependencies.electron.replace("^", "");
    localPkgJson.main = "mainEntry.js";
    delete localPkgJson.scripts;
    delete localPkgJson.devDependencies;
    localPkgJson.devDependencies = {
      electron: electronConfig,
    };
    const tarJsonPath = path.join(process.cwd(), "dist", "package.json");
    fs.writeFileSync(tarJsonPath, JSON.stringify(localPkgJson, null, 2));
    fs.mkdirSync(path.join(process.cwd(), "dist/node_modules"));
  }

  buildInstaller() {
    const options = {
      config: {
        directories: {
          output: path.join(process.cwd(), "release"),
          app: path.join(process.cwd(), "dist"),
        },
        files: ["**"],
        extends: null,
        productName: "ViteElectronDemo",
        appId: "com.vite-electron.demo",
        asar: true,
        nsis: {
          oneClick: true,
          perMachine: true,
          allowToChangeInstallationDirectory: false,
          createDesktopShortcut: true,
          createStartMenuShortcut: true,
          shortcutName: "ViteElectronDemo",
        },
        publish: [
          {
            provider: "generic",
            url: "http://localhost:5500",
          },
        ]
      },
      project: process.cwd(),
    };

    return require("electron-builder").build(options);
  }
}

export const buildPlugin = () => {
  return {
    name: 'build-plugin',
    closeBundle: () => {
      const buildObj = new BuildObj();
      buildObj.buildMain();
      buildObj.preparePackageJson();
      buildObj.buildInstaller();
    }
  };
}