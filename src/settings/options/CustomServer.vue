<!-- @license Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE -->
<template>
  <div class="custom-server">
    <div class="custom-server__label">{{ t("customServerURL") }}</div>
    <div class="custom-server__field">
      <i class="material-icons custom-server__icon">link</i>
      <input
        type="text"
        class="custom-server__input"
        placeholder="localhost:8000"
        v-model="host"
        @input="changeCustomServer"
      />
      <i
        class="material-icons custom-server__status"
        :class="status === 'check' ? 'ok' : 'error'"
        :title="
          status === 'check'
            ? t('customServerTooltipSuccess')
            : t('customServerTooltipError', host + '/meta.json')
        "
        >{{ status }}</i
      >
    </div>
    <div class="custom-server__examples">
      <span>{{ t("customServerHint") }}</span>
      <a href="#" @click.prevent="setExample('http://localhost:8000')"
        >http://localhost:8000</a
      >
      <a
        href="#"
        @click.prevent="setExample('https://iitc.app/build/artifact/PR')"
        >https://iitc.app/build/artifact/PR<i>{number}</i></a
      >
    </div>
  </div>
</template>

<script lang="ts">
import browser from "webextension-polyfill";
import { validateCustomChannelUrl } from "lib-iitc-manager";
import { t } from "@/i18n";

export default defineComponent({
  name: "CustomServer",
  data() {
    return {
      status: "error",
      host: "http://localhost:8000",
    };
  },
  methods: {
    t: t,
    async setInputStatus(host: string) {
      this.status = "error";
      const ok = await validateCustomChannelUrl(host);
      if (ok) this.status = "check";
      return ok;
    },
    async changeCustomServer() {
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
    setExample(host: string) {
      this.host = host;
      this.changeCustomServer();
    },
  },
  async mounted() {
    const networkHost = (await browser.runtime.sendMessage({
      type: "getNetworkHost",
    })) as { custom?: string } | undefined;
    if (networkHost?.custom) this.host = networkHost.custom;
    await this.setInputStatus(this.host);
  },
});
</script>

<style scoped>
.custom-server {
  margin-top: 14px;
  padding: 16px;
  background: var(--surface-container);
  border: 1px solid var(--outline);
  border-radius: 12px;
}

.custom-server__label {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--on-surface);
  margin-bottom: 8px;
}

.custom-server__field {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  background: var(--surface);
  border: 1px solid var(--outline-strong);
  border-radius: 10px;
}

.custom-server__field:focus-within {
  border-color: var(--accent-border);
}

.custom-server__icon {
  font-size: 18px;
  color: var(--on-surface-variant);
  flex-shrink: 0;
}

.custom-server__input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--on-surface);
}

.custom-server__status {
  font-size: 18px;
  flex-shrink: 0;
}

.custom-server__status.ok {
  color: var(--state-success);
}

.custom-server__status.error {
  color: var(--state-error);
}

.custom-server__examples {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  font-size: 12px;
  color: var(--on-surface-variant);
}

.custom-server__examples a {
  padding: 2px 6px;
  background: var(--surface);
  border: 1px solid var(--outline);
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: var(--accent-text);
  text-decoration: none;
}

.custom-server__examples a i {
  color: var(--on-surface-variant);
  font-style: normal;
}
</style>
