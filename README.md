<div align="center">

  # react-native-esbuild

  > ⚡️ An extremely fast bundler + React Native

  ![banner](./main.png)

  [![esbuild](https://img.shields.io/badge/esbuild-ffcf00?logo=esbuild&logoColor=black&style=flat-square)](https://esbuild.github.io)
  [![swc](https://img.shields.io/badge/swc-e47700?logo=swc&logoColor=white&style=flat-square)](https://swc.rs)
  [![react native](https://img.shields.io/badge/react--native-61dafb?logo=react&logoColor=white&style=flat-square)](https://reactnative.dev)
  [![build system](https://img.shields.io/badge/lerna-9333ea?logo=lerna&logoColor=white&style=flat-square)](https://lerna.js.org)
  [![build system](https://img.shields.io/badge/nx-143055?logo=nx&logoColor=white&style=flat-square)](https://nx.dev)


  [![npm](https://img.shields.io/npm/v/@react-native-esbuild/core?color=000000&style=flat-square)](https://www.npmjs.com/settings/react-native-esbuild/packages)
  [![code style](https://img.shields.io/badge/vercel%20code--style-000000?logo=vercel&logoColor=white&style=flat-square)](https://github.com/vercel/style-guide)
  [![typescript](https://img.shields.io/badge/typescript-3178c6?logo=typescript&logoColor=white&style=flat-square)](https://www.typescriptlang.org)

</div>

# Features

> [!WARNING]
> This project is under development

- ⚡️ Blazing Fast Build
- 🌳 Tree Shaking
- 💾 In-memory & Local File System Caching
- 🎨 Flexible & Extensible
- 🔥 Support Hermes Runtime
- 🔄 Support Live Reload
- 🐛 Support Debugging (Flipper, Chrome Debugger)
- ✨ New Architecture Ready
- ~~🌍 Support Web~~ (WIP)

# Setup

```bash
# using npm
npm install -D install @react-native-esbuild/cli

# using yarn
yarn add -D @react-native-esbuild/cli
```

## Android

```bash
# using npm
npm install -D @react-native/gradle-plugin

# using yarn
yarn add -D @react-native/gradle-plugin
```

Go to `android/settings.gradle`.

If `react-native-gradle-plugin` already included, replace to `@react-native/gradle-plugin`

```diff
- includeBuild('../node_modules/react-native-gradle-plugin')
+ includeBuild('../node_modules/@react-native/gradle-plugin')
```

Go to `node_modules/@react-native/gradle-plugin/src/main/kotlin/com/facebook/react/TaskConfiguration.kt`

```diff
// The location of the cli.js file for React Native

- val cliFile = detectedCliFile(config)
+ val cliFile = File(config.root.dir("node_modules/@react-native-esbuild/cli/dist/index.js").get().asFile.absolutePath)
```

and then sync gradle project.

If you want to keep those changes in your environment, checkout [patch-package](https://github.com/ds300/patch-package).

```bash
patch-package @react-native/gradle-plugin
```

## iOS

Open XCode, go to `Build Target > Build Phases > Bundle React Native code and images` and add `CLI_PATH` environment variable.

```diff
set -e

+ CLI_PATH="../node_modules/@react-native-esbuild/cli/dist/index.js"

WITH_ENVIRONMENT="../node_modules/react-native/scripts/xcode/with-environment.sh"
REACT_NATIVE_XCODE="../node_modules/react-native/scripts/react-native-xcode.sh"

/bin/sh -c "$WITH_ENVIRONMENT $REACT_NATIVE_XCODE"
```

## Configurations

File location: `<rootDir>/react-native-esbuild.js`

```js
/**
 * @type {import('@react-native-esbuild/config').ReactNativeEsbuildConfig}
 */
exports.default = {};
```

<details>
  <summary>Configuration details</summary>

```ts
export interface ReactNativeEsbuildConfig {
  /**
   * Enable cache.
   *
   * Defaults to `true`
   */
  cache?: boolean;
  /**
   * Field names for resolve package's modules.
   *
   * Defaults to `['react-native', 'browser', 'main', 'module']`
   *
   * @see Documentation {@link https://esbuild.github.io/api/#main-fields}
   */
  mainFields?: string[];
  /**
   * transform configurations
   */
  transformer?: {
    /**
     * If `true`, convert svg assets to `react-native-svg` based component
     */
    convertSvg?: boolean;
    /**
     * Strip flow syntax.
     * 
     * Defaults to `['react-native']`
     */
    stripFlowPackageNames?: string[];
    /**
     * Transform with babel using `metro-react-native-babel-preset` (slow)
     */
    fullyTransformPackageNames?: string[];
    /**
     * Additional transform rules. This rules will be applied before phase of transform to es5.
     */
    additionalTransformRules?: {
      /**
       * Custom Babel rules
       */
      babel?: CustomBabelTransformRule[];
      /**
       * Custom Swc rules
       */
      swc?: CustomSwcTransformRule[];
    };
  };
}
```
</details>

> [!IMPORTANT]  
> If you've some issues on build, go to troubleshooting guide

- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

# Commands

## Start

Launch dev server

```bash
rne start
```

| Option | Description | Default value |
|:--|:--|:--|
| `--entry-file` | entry file path | `index.js` |
| `--host` | dev server host | `localhost` |
| `--port` | dev server port | `8081` |
| `--verbose` | show cli debug log | `false` |
| `--timestamp` | print timestamp in log | `false` |
| `--reset-cache` | reset transform cache | `false` |

## Bundle

Build bundle

```bash
rne bundle --platform=<platform> --bundle-output=<dest>
```

| Option | Description | Default value |
|:--|:--|:--|
| `--entry-file` | entry file path | `index.js` |
| `--platform` | (required) platform for resolve modules | |
| `--bundle-output` | (required) bundle output file destination | |
| `--sourcemap-output` | sourcemap file destination | |
| `--assets-dest` | assets directory | |
| `--dev` | set as development environment | `true` |
| `--minify` | enable minify | `false` |
| `--metafile` | Export [Esbuild metafile](https://esbuild.github.io/api/#metafile) | `false` |
| `--verbose` | print all logs | `false` |
| `--timestamp` | print timestamp in log | `false` |
| `--reset-cache` | reset transform cache | `false` |

## Cache

Manage transform cache

```bash
# clear transform cache in temporary directory
rne cache clear
```

# Customize

## Plugins

```ts
import {
  ReactNativeEsbuildBundler,
  type EsbuildPluginFactory,
} from '@react-native-esbuild/core';
import {
  createAssetRegisterPlugin,
  createReactNativeRuntimeTransformPlugin,
  createSvgTransformPlugin,
} from '@react-native-esbuild/plugins';

const bundler = new ReactNativeEsbuildBundler(/* bundler config */);

const createMyPlugin: EsbuildPluginFactory<MyPluginConfigType> = (pluginConfig) => {
  return function myPlugin (context) {
    return {
      // implement your custom esbuild plugin here
      name: 'your-custom-esbuild-plugin',
      setup: (build): void {
        // ...
      },
    },
  };
};

bundler
  .registerPlugin(createAssetRegisterPlugin())
  .registerPlugin(createSvgTransformPlugin())
  .registerPlugin(createReactNativeRuntimeTransformPlugin())
  // register custom esbuild plugin
  .registerPlugin(createMyPlugin(config));
```

# Development

```bash
# in example directory,
# run example application (start @react-native-esbuild/dev-server)
yarn start

# build example project (example/dist/<bundle and assets>)
yarn build:android
yarn build:ios
```

```bash
# run yarn commands
yarn workspace <workspaceName> <command>

# build all packages or specified package only
lerna run build
lerna run build --scope @react-native-esbuild/xxx

# run all test or specified package only
yarn test
yarn test --selectProjects <workspaceName>

# show project dependencies graph
nx graph
```

# Architecture

Read [ARCHITECTURE.md](./ARCHITECTURE.md).

# Benchmark

```bash
# in `example` directory

# react-native-esbuild (with cache)
time yarn build:android
time yarn build:ios
# react-native-esbuild (without cache)
time yarn build:android --reset-cache
time yarn build:ios --reset-cache

# metro (with cache)
time yarn bundle:metro:android
time yarn bundle:metro:ios
# metro (without cache)
time yarn bundle:metro:android --reset-cache
time yarn bundle:metro:ios --reset-cache
```

# License

[MIT](./LICENSE)
