/*
 * highlightjs-lineToDiv
 * Plugin for highlightJS that transforms a line into a div element.
 *
 * https://github.com/deleterium/highlightjs-lineToDiv
 */
import type { HighlightResult } from "highlight.js";

export const plugin = (result: HighlightResult): void => {
  /* Configuration */
  const className = "line";
  const idName = "code%line%";
  /* end of configuration */
  const htmlLines = result.value.split("\n");
  let spanStack: string[] = [];
  result.value = htmlLines
    .map((content, index) => {
      let startSpanIndex, endSpanIndex;
      let needle = 0;
      content = spanStack.join("") + content;
      spanStack = [];
      do {
        const remainingContent = content.slice(needle);
        startSpanIndex = remainingContent.indexOf("<span");
        endSpanIndex = remainingContent.indexOf("</span");
        if (startSpanIndex === -1 && endSpanIndex === -1) {
          break;
        }
        if (
          endSpanIndex === -1 ||
          (startSpanIndex !== -1 && startSpanIndex < endSpanIndex)
        ) {
          const nextSpan = /<span .+?>/.exec(remainingContent);
          if (nextSpan === null) {
            // never: but ensure no exception is raised if it happens some day.
            break;
          }
          spanStack.push(nextSpan[0]);
          needle += startSpanIndex + nextSpan[0].length;
        } else {
          spanStack.pop();
          needle += endSpanIndex + 1;
        }
        // eslint-disable-next-line no-constant-condition
      } while (true);
      if (spanStack.length > 0) {
        content += Array(spanStack.length).fill("</span>").join("");
      }
      let retString = "<div ";
      retString += 'data-line-number="' + (index + 1) + '" ';
      if (idName !== undefined) {
        retString +=
          'id="' + idName.replace("%line%", String(index + 1)) + '" ';
      }
      if (className !== undefined) {
        retString += `class="${className}"`;
      }
      retString += `><div>${content}</div></div>`;
      return retString;
    })
    .join("");
};
