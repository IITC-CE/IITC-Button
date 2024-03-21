<!-- @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3 -->
<template>
  <div class="bg" v-if="show">
    <div class="alert">
      <p v-html="title"></p>
      <a v-on:click="openLink(button_url)" href="#" v-html="button_title"></a>
    </div>
  </div>
</template>

<script>
import { mixin } from "./mixins.js";
import { IS_USERSCRIPTS_API } from "@/userscripts/env";
import browser from "webextension-polyfill";

export default {
  name: "Message",
  mixins: [mixin],
  data() {
    return {
      show: false,
      title: this._("alertChromeRequiresDevModeTitle"),
      button_title: this._("alertChromeRequiresDevModeButton"),
      button_url:
        "https://developer.chrome.com/docs/extensions/reference/api/userScripts#developer_mode_for_extension_users",
    };
  },
  mounted() {
    if (IS_USERSCRIPTS_API) {
      browser.runtime
        .sendMessage({
          type: "checkUserScriptsApiAvailable",
        })
        .then();
    }

    const self = this;
    browser.runtime.onMessage.addListener(async function (request) {
      switch (request.type) {
        case "resolveCheckUserScriptsApiAvailable":
          self.$data.show = !request.data;
          break;
      }
    });
  },
};
</script>

<style scoped>
.bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  background: rgb(0 0 0 / 50%);
  justify-content: center;
  align-items: center;
  z-index: 99;
}

.alert {
  background: var(--color-silver);
  border-radius: 10px;
  width: 80%;
  height: fit-content;
  box-sizing: border-box;
  padding: 20px;
  line-height: 150%;
  color: var(--color-black);
  font-weight: 400;
  font-size: 16px;
  box-shadow: 0 0 50px 10px rgb(0 0 0 / 20%);
  z-index: 100;
}

p {
  margin: 0;
}
</style>
