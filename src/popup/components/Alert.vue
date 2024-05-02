<!-- @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3 -->
<template>
  <div class="bg" v-if="showChromeRequiresDevMode || showHostPermissions">
    <div
      class="alert alertChromeRequiresDevMode"
      v-if="showChromeRequiresDevMode"
    >
      <p v-html="_('alertChromeRequiresDevModeTitle')"></p>
      <div
        v-on:click="onClickButton('chromeDevMode')"
        class="button"
        v-html="_('alertChromeRequiresDevModeButton')"
      ></div>
    </div>
    <div class="alert alertHostPermissions" v-if="showHostPermissions">
      <p v-html="_('alertHostPermissionsRequiredTitle')"></p>
      <div
        v-on:click="onClickButton('hostPermissionIntel')"
        class="button"
        v-html="_('alertHostPermissionsRequiredButtonIntel')"
      ></div>
      <div
        v-on:click="onClickButton('hostPermissionAllUrls')"
        class="button hostPermissionAllUrls"
        v-html="_('alertHostPermissionsRequiredButtonAllUrls')"
      ></div>
    </div>
  </div>
</template>

<script>
import { mixin } from "./mixins.js";
import { IS_USERSCRIPTS_API } from "@/userscripts/env";
import browser from "webextension-polyfill";

const intelOrigins = {
  origins: ["https://intel.ingress.com/*"],
};
const allUrlsOrigins = {
  origins: ["http://*/*", "https://*/*"],
};

export default {
  name: "Message",
  mixins: [mixin],
  data() {
    return {
      show: false,
      showChromeRequiresDevMode: false,
      showHostPermissions: false,
    };
  },
  methods: {
    onClickButton: async function (action) {
      switch (action) {
        case "chromeRequiresDevMode":
          await this.openLink(
            "https://developer.chrome.com/docs/extensions/reference/api/userScripts#developer_mode_for_extension_users"
          );
          break;
        case "hostPermissionIntel":
          await this.requestPermissions(intelOrigins);
          break;
        case "hostPermissionAllUrls":
          await this.requestPermissions(allUrlsOrigins);
          break;
      }
    },
    checkHostPermissions: async function () {
      const testIntelPermissionResult = await browser.permissions.contains(
        intelOrigins
      );
      const testAllUrlsPermissionResult = await browser.permissions.contains(
        allUrlsOrigins
      );
      return testIntelPermissionResult || testAllUrlsPermissionResult;
    },
    requestPermissions: async function requestPermissions(permissions) {
      function onResponse(response) {
        if (response) {
          window.close();
        }
      }
      const response = await browser.permissions.request(permissions);
      await onResponse(response);
    },
  },
  async mounted() {
    if (IS_USERSCRIPTS_API) {
      await browser.runtime.sendMessage({
        type: "checkUserScriptsApiAvailable",
      });
    }

    const self = this;
    browser.runtime.onMessage.addListener(async function (request) {
      switch (request.type) {
        case "resolveCheckUserScriptsApiAvailable":
          self.showChromeRequiresDevMode = !request.data;
          break;
      }
    });

    if (!(await this.checkHostPermissions())) {
      this.showHostPermissions = true;
    }
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
  flex-direction: column;
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
  margin: 10px;
  box-shadow: 0 0 50px 10px rgb(0 0 0 / 20%);
  z-index: 100;
}

p {
  margin: 0;
}

.button {
  background: #455a64;
  color: #fff;
  border: #37474f;
  padding: 5px;
  text-align: center;
  margin-top: 10px;
  border-radius: 5px;
}

.button:hover,
.button:active,
.button:focus {
  background: #546e7a;
}

#app.is_safari .hostPermissionAllUrls {
  display: none;
}
</style>
