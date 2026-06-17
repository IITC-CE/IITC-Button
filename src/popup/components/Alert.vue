<!-- @license Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE -->
<template>
  <div class="bg" v-if="showChromeRequiresUserScripts || showHostPermissions">
    <div
      class="alert alertChromeRequiresUserScripts"
      v-if="showChromeRequiresUserScripts"
    >
      <p v-html="t('alertChromeRequiresUserScriptsTitle')"></p>
      <div
        v-on:click="onClickButton('chromeUserScripts')"
        class="button"
        v-html="t('alertChromeRequiresUserScriptsButton')"
      ></div>
    </div>
    <div class="alert alertHostPermissions" v-if="showHostPermissions">
      <p v-html="t('alertHostPermissionsRequiredTitle')"></p>
      <div
        v-on:click="onClickButton('hostPermissionIntel')"
        class="button"
        v-html="t('alertHostPermissionsRequiredButtonIntel')"
      ></div>
      <div
        v-on:click="onClickButton('hostPermissionAllUrls')"
        class="button hostPermissionAllUrls"
        v-html="t('alertHostPermissionsRequiredButtonAllUrls')"
      ></div>
    </div>
  </div>
</template>

<script lang="ts">
import { mixin } from "./mixins";
import { IS_USERSCRIPTS_API } from "@/userscripts/env";
import browser from "webextension-polyfill";

const intelOrigins = {
  origins: ["https://intel.ingress.com/*"],
};
const allUrlsOrigins = {
  origins: ["http://*/*", "https://*/*"],
};

export default defineComponent({
  name: "Message",
  mixins: [mixin],
  data() {
    return {
      show: false,
      showChromeRequiresUserScripts: false,
      showHostPermissions: false,
    };
  },
  methods: {
    onClickButton: async function (action: string) {
      switch (action) {
        case "chromeUserScripts":
          await this.openLink("https://www.tampermonkey.net/faq.php#Q209");
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
      const testIntelPermissionResult =
        await browser.permissions.contains(intelOrigins);
      const testAllUrlsPermissionResult =
        await browser.permissions.contains(allUrlsOrigins);
      return testIntelPermissionResult || testAllUrlsPermissionResult;
    },
    requestPermissions: async function requestPermissions(
      permissions: browser.Permissions.Permissions,
    ) {
      function onResponse(response: boolean) {
        if (response) {
          window.close();
        }
      }
      const response = await browser.permissions.request(permissions);
      await onResponse(response);
    },
  },
  async mounted() {
    browser.runtime.onMessage.addListener(async (request: unknown) => {
      const msg = request as { type: string; data?: boolean };
      switch (msg.type) {
        case "resolveCheckUserScriptsApiAvailable":
          this.showChromeRequiresUserScripts = !msg.data;
          break;
      }
    });

    if (IS_USERSCRIPTS_API) {
      await browser.runtime.sendMessage({
        type: "checkUserScriptsApiAvailable",
      });
    }

    if (!(await this.checkHostPermissions())) {
      this.showHostPermissions = true;
    }
  },
});
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
