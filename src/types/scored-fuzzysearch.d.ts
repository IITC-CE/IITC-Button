// Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE
declare module "scored-fuzzysearch" {
  interface SearcherOptions {
    scoreIncreasePerSequencialMatchedLetter?: number;
    initialScoreDecreasePerLetter?: number;
    scoreDecreasePerLetterBeforeMatch?: number;
    scoreDecreasePerLetterAfterMatch?: number;
  }

  interface MatchIndex {
    start: number;
    length: number;
  }

  type Searcher = (needle: string, haystack: string) => number;

  export function createSearcher(options: SearcherOptions): Searcher;
  export function fuzzysearch(needle: string, haystack: string): number;
  export function findMatchIndices(
    needle: string,
    haystack: string,
  ): MatchIndex[] | 0;
}
