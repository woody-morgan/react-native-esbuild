/* eslint-disable quotes -- allow quote in template literal */
import { ReactNativeEsbuildDevServer } from '@react-native-esbuild/dev-server';
import {
  createAssetRegisterPlugin,
  createReactNativeRuntimeTransformPlugin,
  createSvgTransformPlugin,
} from '@react-native-esbuild/plugins';
import { enableInteractiveMode } from '../helpers';
import { logger } from '../shared';
import type { Command, StartOptions } from '../types';

// eslint-disable-next-line @typescript-eslint/require-await -- no async task in start command yet
export const start: Command<StartOptions> = async (options) => {
  const startOptions = options;
  const { bundler, server } = new ReactNativeEsbuildDevServer(
    startOptions,
  ).initialize();

  bundler
    .registerPlugin(createAssetRegisterPlugin())
    .registerPlugin(createSvgTransformPlugin())
    .registerPlugin(createReactNativeRuntimeTransformPlugin());

  server.listen(() => {
    if (
      enableInteractiveMode((keyName) => {
        switch (keyName) {
          case 'r':
            logger.info(`sending 'reload' command...`);
            server.broadcastCommand('reload');
            break;

          case 'd':
            logger.info(`sending 'devMenu' command...`);
            server.broadcastCommand('devMenu');
            break;
        }
      })
    ) {
      logger.info(`> press 'r' to reload`);
      logger.info(`> press 'd' to open developer menu`);
      process.stdout.write('\n');
    }
  });
};
