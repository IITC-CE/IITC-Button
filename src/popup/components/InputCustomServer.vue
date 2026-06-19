<!-- @license Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE -->
<template>
  <div class="server">
    <input
      type="text"
      class="server-input"
      placeholder="localhost:8000"
      v-model="host"
      @input="changeCustomServer"
    />
    <i
      class="icon material-icons"
      :class="[iconName === 'check' ? 'ok' : 'error']"
      v-bind:title="
        iconName === 'check'
          ? t('customServerTooltipSuccess')
          : t('customServerTooltipError', host + '/meta.json')
      "
      v-html="iconName"
    ></i>
    <p class="example">
      {{ t("customServerHint") }}
      <a
        href="#"
        class="example__item"
        @click="setExample('http://localhost:8000')"
        >http://localhost:8000</a
      >,
      <a
        href="#"
        class="example__item"
        @click="setExample('https://iitc.app/build/artifact/PR')"
        >https://iitc.app/build/artifact/PR<i>{number}</i></a
      >
    </p>
  </div>
</template>

<script lang="ts">
import browser from "webextension-polyfill";
import { validateCustomChannelUrl } from "lib-iitc-manager";
import { mixin } from "./mixins";

export default defineComponent({
  name: "InputCustomServer",
  props: {
    channel: String,
  },
  data() {
    return {
      iconName: "error",
      host: "http://localhost:8000",
    };
  },
  mixins: [mixin],
  methods: {
    setInputStatus: async function (host: string) {
      this.iconName = "error";
      const status = await validateCustomChannelUrl(host);
      if (status) {
        this.iconName = "check";
      }
      return status;
    },
    changeCustomServer: async function () {
      let connected = await this.setInputStatus(this.host);

      if (!connected && !this.host.startsWith("http")) {
        const http_host = "http://" + this.host;
        if (await this.setInputStatus(http_host)) {
          connected = true;
          this.host = http_host;
        }
      }

      if (connected) {
        await browser.runtime.sendMessage({
          type: "setCustomChannelUrl",
          value: this.host,
        });
      }
    },
    setExample: function (host: string) {
      this.host = host;
      this.changeCustomServer();
    },
  },
  async mounted() {
    const networkHost = (await browser.runtime.sendMessage({
      type: "getNetworkHost",
    })) as { custom?: string } | undefined;
    if (networkHost?.custom) {
      this.host = networkHost.custom;
    }
    await this.setInputStatus(this.host);
  },
});
</script>

<style scoped>
.server {
  display: flex;
  flex-direction: column;
}

.server-input {
  box-sizing: border-box;
  width: 100%;
  padding: 5px 30px 5px 3px;
  flex: auto;
  font-weight: 500;
}

.icon {
  position: absolute;
  right: 18px;
  margin-top: 5px;
}

.ok {
  color: var(--state-on);
}
.error {
  color: var(--state-off);
}

.example {
  margin: 4px 0;
}
.example__item {
  color: #000;
  padding: 3px;
  display: inline-block;
  background: #f4f4f4;
  border: 1px solid #e3e3e3;
  border-radius: 3px;
  text-decoration: none;
  margin: 1px;
}
</style>
