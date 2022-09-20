import { fuzzysearch } from "scored-fuzzysearch";

const score = (query, text) => {
  if (text === undefined) return 0;
  return fuzzysearch(query, text);
};

const setPluginScore = (p, q) => {
  const lang = browser.i18n.getUILanguage();
  p._search_score = Math.max(
    score(q, p.name),
    score(q, p["name:" + lang]),
    score(q, p.description),
    score(q, p["description:" + lang]),
    score(q, p.category)
  );
  return p;
};

const sortScoredPlugins = arr => {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i]._search_score < arr[j]._search_score) {
        let swap = arr[i];
        arr[i] = arr[j];
        arr[j] = swap;
      }
    }
  }
  return arr;
};

export function searchPlugins(query, plugins_obj) {
  const plugins = Object.keys(plugins_obj).map(key => plugins_obj[key]);
  const scored_plugins = plugins.map(plugin => setPluginScore(plugin, query));
  const sorted_plugins = sortScoredPlugins(scored_plugins);
  const result_plugins = sorted_plugins.filter(p => p._search_score);
  return result_plugins;
}
