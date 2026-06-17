//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

import browser from "webextension-polyfill";

import { fuzzysearch } from "scored-fuzzysearch";
import type { Plugin, PluginDict } from "lib-iitc-manager";

export type ScoredPlugin = Plugin & { _search_score: number };

const score = (query: string, text: string | undefined): number => {
  if (text === undefined) return 0;
  return fuzzysearch(query, text);
};

const setPluginScore = (p: Plugin, q: string): ScoredPlugin => {
  const lang = browser.i18n.getUILanguage();
  const scored = p as ScoredPlugin;
  scored._search_score = Math.max(
    score(q, p.name),
    score(q, p["name:" + lang] as string | undefined),
    score(q, p.description),
    score(q, p["description:" + lang] as string | undefined),
    score(q, p.category),
  );
  return scored;
};

const sortScoredPlugins = (arr: ScoredPlugin[]): ScoredPlugin[] => {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i]._search_score < arr[j]._search_score) {
        const swap = arr[i];
        arr[i] = arr[j];
        arr[j] = swap;
      }
    }
  }
  return arr;
};

export function searchPlugins(
  query: string,
  plugins_obj: PluginDict,
): ScoredPlugin[] {
  const plugins = Object.keys(plugins_obj).map((key) => plugins_obj[key]);
  const scored_plugins = plugins.map((plugin) => setPluginScore(plugin, query));
  const sorted_plugins = sortScoredPlugins(scored_plugins);
  const result_plugins = sorted_plugins.filter((p) => p._search_score);
  return result_plugins;
}
