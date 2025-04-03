import type { Plugin } from 'unified';
import type { Root as MdastRoot } from 'mdast';
import type { Root as HastRoot } from './hast';

export type UnifiedPlugin<Options = void> = Plugin<[Options?], MdastRoot>;
export type UnifiedPluginWithoutOptions = Plugin<[], MdastRoot>;
export type UnifiedPluginAsync<Options = void> = Plugin<[Options?], Promise<MdastRoot>>;

// Helper type for plugin factories
export type PluginFactory<Options = void> = (options?: Options) => UnifiedPlugin<Options>;
export type AsyncPluginFactory<Options = void> = (options?: Options) => UnifiedPluginAsync<Options>;
