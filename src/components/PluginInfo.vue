<!-- @license Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE -->
<template>
  <div class="plugin-info">
    <div class="plugin-info__header">
      <img class="plugin-info__icon" :src="icon" alt="" />
      <div class="plugin-info__heading">
        <h3 class="plugin-info__name">{{ meta.name }}</h3>
        <span class="plugin-info__category">{{
          meta.category || t("defaultCategory")
        }}</span>
      </div>
    </div>

    <div
      v-if="notice"
      class="plugin-info__notice"
      :class="`plugin-info__notice--${notice.level}`"
    >
      <i class="material-icons plugin-info__notice-icon">{{
        notice.level === "warning" ? "warning" : "info"
      }}</i>
      <span>{{ notice.text }}</span>
    </div>

    <div
      class="plugin-info__details"
      v-if="meta.description || meta.version || meta.author"
    >
      <p class="plugin-info__description" v-if="meta.description">
        {{ meta.description }}
      </p>
      <div class="plugin-info__row" v-if="meta.version">
        <span class="plugin-info__label">{{ t("version") }}</span>
        <span class="plugin-info__value">{{ meta.version }}</span>
      </div>
      <div class="plugin-info__row" v-if="meta.author">
        <span class="plugin-info__label">{{ t("author") }}</span>
        <span class="plugin-info__value">{{ meta.author }}</span>
      </div>
    </div>

    <template v-if="detailed">
      <div class="plugin-info__domains">
        <span class="plugin-info__domains-label" v-if="domains === null">{{
          t("jsViewDetailsNoDomains")
        }}</span>
        <span
          class="plugin-info__domains-label"
          v-if="domains === '<all_domains>'"
          >{{ t("jsViewDetailsAllDomains") }}</span
        >
        <template v-if="typeof domains === 'object' && domains">
          <span class="plugin-info__domains-label">{{
            t("jsViewDetailsDomainsLabel")
          }}</span>
          <span
            class="plugin-info__chip"
            v-for="(domain, i) in domains"
            :key="i"
            >{{ domain }}</span
          >
        </template>
      </div>

      <div class="plugin-info__raw" :class="{ opened: show_details }">
        <div v-for="(key, ki) in matchKeys" :key="ki">
          <div class="plugin-info__raw-item" v-if="meta[key]">
            <span class="plugin-info__raw-label">@{{ key }}</span>
            <span
              class="plugin-info__chip"
              v-for="(el, i) in meta[key]"
              :key="i"
              >{{ el }}</span
            >
          </div>
        </div>
      </div>

      <div class="plugin-info__footer">
        <a href="#" class="plugin-info__more" @click.prevent="toggleDetails">
          {{
            show_details
              ? t("jsViewDetailsHideDetails")
              : t("jsViewDetailsShowDetails")
          }}
        </a>
        <slot name="action"></slot>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { type PropType } from "vue";
import browser from "webextension-polyfill";
import { t } from "@/i18n";
import { humanizeMatch } from "lib-iitc-manager";
import type { PluginMeta } from "lib-iitc-manager";

export default defineComponent({
  name: "PluginInfo",
  props: {
    meta: {
      type: Object as PropType<PluginMeta>,
      required: true as const,
    },
    notice: {
      type: Object as PropType<{
        level: "warning" | "info";
        text: string;
      } | null>,
      default: null,
    },
    detailed: {
      type: Boolean,
      default: false,
    },
    darkIcon: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      domains: null as string | string[] | null,
      show_details: false,
      matchKeys: ["match", "include", "exclude-match", "exclude", "grant"],
    };
  },
  methods: {
    t: t,
    async toggleDetails() {
      this.show_details = !this.show_details;
      await browser.storage.local.set({
        js_view_show_details: this.show_details,
      });
    },
  },
  computed: {
    icon(): string {
      const icon64 = this.meta["icon64"];
      const icon = this.meta["icon"];
      if (typeof icon64 === "string" && icon64) return icon64;
      if (typeof icon === "string" && icon) return icon;
      return this.darkIcon
        ? "/assets/icons/userscript-no-icon-dark.svg"
        : "/assets/icons/userscript-no-icon.svg";
    },
  },
  watch: {
    meta: {
      immediate: true,
      handler() {
        this.domains = humanizeMatch(this.meta);
      },
    },
  },
  async mounted() {
    if (!this.detailed) return;
    const data = await browser.storage.local.get(["js_view_show_details"]);
    if (data["js_view_show_details"] === true) this.show_details = true;
  },
});
</script>

<style scoped>
.plugin-info__header {
  display: flex;
  align-items: center;
  gap: 16px;
}
.plugin-info__icon {
  width: 48px;
  height: 48px;
  box-sizing: border-box;
  flex-shrink: 0;
  object-fit: contain;
}
.plugin-info__heading {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.plugin-info__name {
  margin: 0;
  margin-top: -1px;
  font-size: var(--plugin-info-name-size, 20px);
  font-weight: 600;
  color: var(--on-surface);
  overflow-wrap: anywhere;
}
.plugin-info__category {
  font-size: 13px;
  color: var(--on-surface-variant);
}

.plugin-info__notice {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 16px;
  padding: 10px 14px;
  border-radius: 10px;
  background: var(--surface-container);
  font-size: 12px;
  line-height: 1.4;
  color: var(--on-surface);
}
.plugin-info__notice-icon {
  flex-shrink: 0;
  font-size: 18px;
}
.plugin-info__notice--warning .plugin-info__notice-icon {
  color: var(--state-warning);
}
.plugin-info__notice--info .plugin-info__notice-icon {
  color: var(--accent);
}

.plugin-info__details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
  padding: 14px 16px;
  background: var(--surface-container);
  border-radius: 12px;
}
.plugin-info__description {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: var(--on-surface);
}
.plugin-info__row {
  display: flex;
  gap: 12px;
  align-items: baseline;
}
.plugin-info__label {
  width: 64px;
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--on-surface-variant);
}
.plugin-info__value {
  font-size: 13px;
  color: var(--on-surface);
  word-break: break-word;
}

.plugin-info__domains {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 18px;
  font-size: 12px;
}
.plugin-info__domains-label {
  width: 100%;
  margin-bottom: 2px;
  color: var(--on-surface-variant);
}
.plugin-info__chip {
  padding: 3px 8px;
  margin: 2px 4px 2px 0;
  border-radius: 6px;
  background: var(--surface-container);
  color: var(--on-surface);
  font-family: var(--font-mono);
  font-size: 11.5px;
  overflow-wrap: anywhere;
}

.plugin-info__raw {
  display: none;
  margin-top: 12px;
}
.plugin-info__raw.opened {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 16px;
}
.plugin-info__raw-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.plugin-info__raw-label {
  font-size: 11px;
  font-weight: 600;
  font-family: var(--font-mono);
  color: var(--accent);
}
.plugin-info__raw .plugin-info__chip {
  background: transparent;
  padding: 0;
  margin: 0;
  color: var(--on-surface-variant);
  font-size: 11px;
  word-break: break-all;
}

.plugin-info__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
}
.plugin-info__more {
  font-size: 13px;
  font-weight: 600;
  color: var(--accent);
  text-decoration: none;
  cursor: pointer;
}
.plugin-info__more:hover {
  text-decoration: underline;
}
</style>
