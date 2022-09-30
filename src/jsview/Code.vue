<!-- @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3 -->
<template>
  <highlightjs language="javascript" v-if="code" :code="code" />
  <div class="message" v-else>{{ status }}</div>
</template>

<script>
import hljsVuePlugin from "@highlightjs/vue-plugin";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import { plugin } from "@/jsview/highlightjs-lineToDiv";
import "highlight.js/styles/darcula.css";

hljs.registerLanguage("javascript", javascript);
hljs.addPlugin({
  "after:highlight": plugin
});

export default {
  name: "Code",
  components: {
    highlightjs: hljsVuePlugin.component
  },
  props: {
    code: String,
    status: String
  }
};
</script>

<style src="../../public/assets/noto/noto-font.css"></style>

<style>
pre {
  margin: 0;
}

.hljs {
  font-family: "Noto Sans Mono", monospace;
  padding: 30px 6px;
  font-size: 14px;
}

.hljs .line::before {
  content: attr(data-line-number);
  display: inline-block;
  width: 2.5rem;
  text-align: right;
  padding-right: 5px;
  color: #7f7f7f;
  border-right: 1px solid #555;
  margin-right: 20px;
}
</style>
