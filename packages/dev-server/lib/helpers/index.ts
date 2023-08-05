import type { ParsedUrlQuery } from 'node:querystring';
import { z } from 'zod';
import type { LogLevel } from '@react-native-esbuild/utils';
import type { DevServerMiddleware, LogMessage } from '../types';

export type ParsedBundlerOptions = z.infer<typeof bundleSearchParamSchema>;

const toBoolean = (val: z.infer<typeof boolean>): boolean => val === 'true';

const boolean = z.union([z.literal('true'), z.literal('false')]);
const bundleSearchParamSchema = z
  .object({
    // required
    platform: z.union([
      z.literal('android'),
      z.literal('ios'),
      z.literal('web'),
    ]),
    // optional
    dev: boolean.default('true').transform(toBoolean),
    minify: boolean.default('false').transform(toBoolean),
    runModule: boolean.default('false').transform(toBoolean),
  })
  .required();

export function parseBundleOptionsFromSearchParams(
  query: ParsedUrlQuery,
): ParsedBundlerOptions {
  const platform = query.platform;
  const dev = query.dev;
  const minify = query.minify;
  const runModule = query.runModule;

  return bundleSearchParamSchema.parse({
    platform,
    dev,
    minify,
    runModule,
  });
}

export function toSafetyMiddleware(
  middleware: DevServerMiddleware,
): DevServerMiddleware {
  return function wrap(request, response, next) {
    try {
      middleware(request, response, next);
    } catch (error) {
      response.writeHead(500).end();
    }
  };
}

export function convertHmrLogLevel(level: LogMessage['level']): LogLevel {
  switch (level) {
    case 'group':
    case 'groupCollapsed':
    case 'groupEnd':
    case 'trace':
      return 'log';

    default:
      return level;
  }
}
