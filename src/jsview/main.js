//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3
import Vue from "vue";
import VueHighlightJS from "vue-highlight.js";
import javascript from "highlight.js/lib/languages/javascript";
import "highlight.js/styles/default.css";
import App from "./App.vue";

Vue.use(VueHighlightJS, {
  languages: {
    javascript
  }
});

/* eslint-disable no-new */
new Vue({
  el: "#app",
  render: h => h(App)
});
