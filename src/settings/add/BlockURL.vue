<!-- @license Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE -->
<template>
  <div class="url_zone">
    <div class="url_field">
      <i class="material-icons url_field__icon">link</i>
      <input
        id="url_input"
        type="url"
        placeholder="https://example.com/awesome-iitc-plugin.user.js"
        v-on:keyup="url_input_keyup"
        v-model="url"
      />
    </div>
    <button
      id="url_button"
      class="btn-primary"
      :class="{ disabled: !url }"
      v-on:click="loadByUrl"
    >
      {{ t("install") }}
    </button>
  </div>
</template>

<script lang="ts">
import browser from "webextension-polyfill";
import { fetchResource, parseMeta } from "lib-iitc-manager";
import { t } from "@/i18n";

export default defineComponent({
  name: "BlockURL",
  data() {
    return {
      url: "",
    };
  },
  methods: {
    t: t,
    url_input_keyup: async function (event: KeyboardEvent) {
      if (event.key === "Enter") {
        await this.loadByUrl();
      }
    },
    loadByUrl: async function () {
      const url = this.url;
      this.url = "";

      const { data: code } = (await fetchResource(url)) as {
        data: string | null;
      };

      if (!code) {
        alert(t("addressNotAvailable"));
        return;
      }

      if (code) {
        const scripts = [];
        let message = "";
        const meta = parseMeta(code);
        const filename = url.substr(url.lastIndexOf("/") + 1);

        if (
          meta === null ||
          Object.keys(meta).length === 0 ||
          meta["name"] === undefined
        ) {
          message += t("notValidUserScript", filename) + "\n";
        } else {
          message +=
            t("addedUserScriptTo", [filename, meta["category"] ?? ""]) + "\n";
          meta["filename"] = filename;
          scripts.push({ meta: meta, code: code });
        }

        alert(message);
        await browser.runtime.sendMessage({
          type: "addUserScripts",
          scripts: scripts,
        });
      }
    },
  },
});
</script>

<style scoped>
.url_zone {
  display: flex;
  gap: 10px;
}

.url_field {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--surface-container);
  border: 1px solid var(--outline);
  border-radius: 10px;
  padding: 10px 14px;
}

.url_field:focus-within {
  border-color: var(--accent-border);
}

.url_field__icon {
  color: var(--on-surface-variant);
  font-size: 18px;
  flex-shrink: 0;
}

#url_input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  font-family: var(--font-mono);
  font-size: 13.5px;
  color: var(--on-surface);
}

#url_input::placeholder {
  color: var(--on-surface-variant);
}
</style>
