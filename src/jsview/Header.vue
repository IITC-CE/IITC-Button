<!-- @license Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE -->
<template>
  <div class="addUserScript-wrapper">
    <div id="addUserScript" class="col" v-bind:class="{ hide: !show_header }">
      <div class="row">
        <div class="col">
          <img class="plugin__icon" :src="getIcon" v-if="getIcon" />
        </div>
        <div class="col">
          <h3>{{ meta.name }}</h3>
          <span v-if="meta.version" class="version">v{{ meta.version }}</span>
        </div>
      </div>
      <span class="description">{{ meta.description }}</span>

      <div class="row simple-details">
        <span class="label" v-if="domains === null">{{
          t("jsViewDetailsNoDomains")
        }}</span>
        <span class="label" v-if="domains === '<all_domains>'">{{
          t("jsViewDetailsAllDomains")
        }}</span>
        <template v-if="typeof domains === 'object'">
          <span class="label">{{ t("jsViewDetailsDomainsLabel") }}</span>
          <span class="value" v-for="(domain, i) in domains" v-bind:key="i">
            {{ domain }}</span
          >
        </template>
      </div>

      <div class="row details" :class="{ opened: show_details }">
        <div
          v-for="(key, ki) in [
            'match',
            'include',
            'exclude-match',
            'exclude',
            'grant',
          ]"
          v-bind:key="ki"
        >
          <div class="col item" v-if="meta[key]">
            <span class="label">@{{ key }}</span>
            <span class="value" v-for="(el, i) in meta[key]" v-bind:key="i">
              {{ el }}
            </span>
          </div>
        </div>
      </div>
      <a href="#" class="btn-more" @click.prevent="on_show_details">
        {{
          show_details
            ? t("jsViewDetailsHideDetails")
            : t("jsViewDetailsShowDetails")
        }}
      </a>

      <div id="install" class="btn" @click="install">{{ button_name }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { toRaw, type PropType } from "vue";
import browser from "webextension-polyfill";
import { t } from "@/i18n";
import { getUID, humanizeMatch, IITC_CORE_UID } from "lib-iitc-manager";
import type { PluginMeta } from "lib-iitc-manager";
import { uuidv4 } from "@/uuid";

export default defineComponent({
  name: "Header",
  props: {
    meta: {
      type: Object as PropType<PluginMeta>,
      required: true as const,
    },
    code: String,
  },
  data() {
    return {
      show_header: false,
      button_name: t("install"),
      domains: null as string | string[] | null,
      show_details: false,
      page_uuid: uuidv4(),
    };
  },
  methods: {
    t: t,
    install: async function () {
      const script = [{ meta: toRaw(this.meta), code: this.code }];
      await browser.runtime.sendMessage({
        type: "addUserScripts",
        id: this.page_uuid,
        scripts: script,
      });
    },
    checkIfInstalled: async function () {
      const uid = getUID(this.meta);
      if (uid === IITC_CORE_UID) {
        this.button_name = t("reinstall");
      }
      await browser.runtime.sendMessage({
        type: "getPluginInfo",
        uid: uid,
      });
    },
    setListeners: function () {
      browser.runtime.onMessage.addListener((request: unknown) => {
        const msg = request as {
          type: string;
          info?: unknown;
          id?: string;
          scripts?: Record<
            string,
            { uid?: string; name?: string; category?: string }
          >;
        };
        switch (msg.type) {
          case "resolveGetPluginInfo":
            if (msg.info) {
              this.button_name = t("reinstall");
            }
            break;
          case "resolveAddUserScripts":
            if (msg.id !== this.page_uuid) return;
            Object.entries(msg.scripts ?? {}).map(([, script]) => {
              let message = "";
              if (script["uid"] === IITC_CORE_UID) {
                message =
                  t("addedCustomIITCCore", [script["name"] ?? ""]) + "\n";
              } else {
                message =
                  t("addedUserScriptTo", [
                    script["name"] ?? "",
                    script["category"] ?? "",
                  ]) + "\n";
              }
              alert(message);
              this.button_name = t("reinstall");
            });
        }
      });
    },
    on_show_details: async function () {
      this.show_details = !this.show_details;
      await browser.storage.local.set({
        js_view_show_details: this.show_details,
      });
    },
  },
  watch: {
    meta: function () {
      this.domains = humanizeMatch(this.meta);
    },
    code: async function () {
      this.show_header = true;
      this.setListeners();
      await this.checkIfInstalled();
    },
  },
  computed: {
    getIcon: function (): string | null {
      const icon64 = this.meta["icon64"];
      const icon = this.meta["icon"];
      if (typeof icon64 === "string" && icon64) return icon64;
      if (typeof icon === "string" && icon) return icon;
      return null;
    },
  },
  async mounted() {
    browser.storage.local.get(["js_view_show_details"]).then((data) => {
      if (data["js_view_show_details"] === true) {
        this.show_details = true;
      }
    });
  },
});
</script>

<style scoped>
.row {
  display: flex;
  flex-direction: row;
}

.col {
  display: flex;
  flex-direction: column;
}

h3 {
  margin: 0;
}

.addUserScript-wrapper {
  display: flex;
  background: #0e3d4e;
  color: #fff;
  border-right: 3px solid #316577;
  width: 500px;
}

#addUserScript {
  padding: 1.6em;
  width: 100%;
  font-size: 18px;
  transition: opacity 0.1s linear;
}
#addUserScript.hide {
  opacity: 0;
}

.description {
  font-size: 16px;
  line-height: 22px;
  margin-top: 20px;
}

.btn {
  cursor: pointer;
  padding: 10px 22px;
  background: #fff;
  color: #222;
  border-radius: 3px;
  display: inline-block;
  height: 22px;
  margin: 20px auto 0 0;
}

.btn:hover {
  background: #efefef;
}

.version {
  font-size: 14px;
  color: #bbb;
  margin-top: 5px;
}

.details {
  font-size: 12px;
  height: 0;
  flex-wrap: wrap;
  overflow: hidden;
  transition: margin 0.1s ease-in-out;
}

.details.opened {
  margin: 10px 0;
  height: auto;
}

.details .item {
  margin-top: 5px;
}

.details .item span {
  margin-right: 20px;
}

.details .label {
  font-weight: bold;
  margin-bottom: 5px;
}

.simple-details {
  font-size: 12px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.simple-details .label {
  padding: 5px 15px 5px 0;
  margin: 2px 0;
}

.simple-details .value {
  background: rgba(0, 0, 0, 0.3);
  padding: 5px 8px;
  border-radius: 3px;
  color: inherit;
  text-decoration: none;
  margin: 2px 4px 2px 0;
}

.btn-more {
  margin: 4px auto 0 0;
  font-size: 13px;
  color: #fff;
}

.plugin__icon {
  height: 48px;
  margin-right: 15px;
}

@media (max-width: 1600px) {
  .addUserScript-wrapper {
    width: 100%;
    border-bottom: 3px solid #316577;
    border-right: none;
  }
  #addUserScript {
    margin: auto;
    width: 80%;
    max-width: 800px;
    padding: 1.8em;
  }
}

@media (max-width: 600px) {
  #addUserScript {
    width: 100%;
    padding: 1em;
  }
}
</style>
