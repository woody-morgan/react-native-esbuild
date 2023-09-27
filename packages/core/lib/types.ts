import type { BuildContext, Plugin } from 'esbuild';
import type { TransformOptions as BabelTransformOptions } from '@babel/core';
import type { Options as SwcTransformOptions } from '@swc/core';
import type { BundleOptions } from '@react-native-esbuild/config';

export interface Config {
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
   */
  mainFields?: string[];
  /**
   * Logger configurations
   */
  logger?: {
    /**
     * Disable log.
     *
     * Defaults to `false`
     */
    disabled?: boolean;
    /**
     * Print timestamp with log when format is specified.
     *
     * Defaults to `null`
     */
    timestamp?: string | null;
  };
  /**
   * Transformer configurations
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
      babel?: BabelTransformRule[];
      /**
       * Custom Swc rules
       */
      swc?: SwcTransformRule[];
    };
  };
  /**
   * Client event receiver
   */
  reporter?: (event: ReportableEvent) => void;
}

interface CustomTransformRuleBase<T> {
  /**
   * Predicator for transform
   */
  test: (path: string, code: string) => boolean;
  /**
   * Transformer options
   */
  options: T | ((path: string, code: string) => T);
}

export type BabelTransformRule = CustomTransformRuleBase<BabelTransformOptions>;
export type SwcTransformRule = CustomTransformRuleBase<SwcTransformOptions>;

export type BundleMode = 'bundle' | 'watch';
export type InternalCaller = 'dev-server';

export interface BuildTask {
  context: BuildContext;
  handler: PromiseHandler<BundleResult> | null;
  status: 'pending' | 'resolved';
  buildCount: number;
}

export interface BundleResult {
  source: Uint8Array;
  sourcemap: Uint8Array;
  bundledAt: Date;
  revisionId: string;
}

export enum BundleTaskSignal {
  EmptyOutput,
}

export type EsbuildPluginFactory<PluginConfig = void> = (
  config?: PluginConfig,
) => (context: PluginContext) => Plugin;

export type BundlerAdditionalData = Record<string, unknown>;

export interface PluginContext extends BundleOptions {
  id: number;
  root: string;
  config: Config;
  mode: BundleMode;
  additionalData?: BundlerAdditionalData;
}

export interface BundleRequestOptions {
  dev?: BundleOptions['dev'];
  minify?: BundleOptions['minify'];
  platform: BundleOptions['platform'];
  runModule: boolean;
}

export interface PromiseHandler<Result> {
  task: Promise<Result>;
  resolver?: (val: Result) => void;
  rejecter?: (reason?: unknown) => void;
}

export interface Cache {
  data: string;
  modifiedAt: number;
}

export type Transformer<Options> = (
  code: string,
  context: { path: string; root: string },
  customOption?: Options,
) => string | Promise<string>;

export type ReportableEvent = ClientLogEvent;

/**
 * Event reportable event types
 *
 * @see {@link https://github.com/facebook/metro/blob/v0.78.0/packages/metro/src/lib/reporting.js#L36}
 */
export interface ClientLogEvent {
  type: 'client_log';
  level:
    | 'trace'
    | 'info'
    | 'warn'
    /**
     * In react-native, ReportableEvent['level'] does not defined `error` type.
     * But, flipper supports the `error` type.
     *
     * @see {@link https://github.com/facebook/flipper/blob/v0.211.0/desktop/flipper-common/src/server-types.tsx#L76}
     */
    | 'error'
    | 'log'
    | 'group'
    | 'groupCollapsed'
    | 'groupEnd'
    | 'debug';
  data: unknown[];
  mode: 'BRIDGE' | 'NOBRIDGE';
}
