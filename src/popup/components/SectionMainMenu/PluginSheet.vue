<!-- @license Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE -->
<template>
  <Transition name="sheet">
    <div v-if="plugin" class="sheet" @click.self="$emit('close')">
      <div class="sheet__panel">
        <button
          class="sheet__close"
          :title="t('close')"
          @click="$emit('close')"
        >
          <i class="material-icons">close</i>
        </button>

        <OverlayScrollbarsComponent
          ref="osRef"
          class="sheet__scroll"
          :options="osOptions"
        >
          <div class="sheet__body">
            <PluginInfo :meta="plugin" :notice="notice"></PluginInfo>

            <div class="sheet__actions">
              <button
                v-if="homepageURL"
                class="sheet__btn"
                @click="openLink(homepageURL)"
              >
                <i class="material-icons">home</i>
                {{ t("pluginOpenHomepage") }}
              </button>
              <button
                v-if="issueTracker"
                class="sheet__btn"
                @click="openLink(issueTracker)"
              >
                <i class="material-icons">bug_report</i>
                {{ t("pluginOpenIssues") }}
              </button>
              <button v-if="plugin.user" class="sheet__btn" @click="save">
                <i class="material-icons">save</i>
                {{ t("pluginSave") }}
              </button>
              <button
                v-if="plugin.user || plugin.override"
                class="sheet__btn sheet__btn--danger"
                @click="$emit('remove', plugin)"
              >
                <i class="material-icons">delete</i>
                {{
                  plugin.override
                    ? t("pluginRemoveOverride")
                    : t("pluginDelete")
                }}
              </button>
            </div>
          </div>
        </OverlayScrollbarsComponent>
      </div>
    </div>
  </Transition>
</template>

<script lang="ts">
import { type PropType } from "vue";
import { mixin } from "@/popup/components/mixins";
import { sanitizeFileName } from "lib-iitc-manager";
import type { Plugin } from "lib-iitc-manager";
import PluginInfo from "@/components/PluginInfo.vue";
import { OverlayScrollbarsComponent } from "overlayscrollbars-vue";
import type { PartialOptions } from "overlayscrollbars";

const saveJS = (function () {
  const a = document.createElement("a");
  document.body.appendChild(a);
  a.style.display = "none";
  return function (data: string, fileName: string) {
    const blob = new Blob([data], { type: "application/x-javascript" });
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };
})();

export default defineComponent({
  name: "PluginSheet",
  components: { PluginInfo, OverlayScrollbarsComponent },
  mixins: [mixin],
  props: {
    plugin: {
      type: Object as PropType<Plugin | null>,
      default: null,
    },
  },
  emits: ["close", "remove"],
  data(): { osOptions: PartialOptions } {
    return {
      osOptions: {
        scrollbars: {
          theme: "iitc-scrollbar",
          autoHide: "never",
          dragScroll: true,
        },
      },
    };
  },
  computed: {
    notice(): { level: "warning" | "info"; text: string } | null {
      if (!this.plugin) return null;
      if (this.plugin.override)
        return { level: "warning", text: this.t("pluginOverrideNotice") };
      if (this.plugin.user)
        return { level: "info", text: this.t("pluginUserNotice") };
      return null;
    },
    homepageURL(): string {
      const url = this.plugin?.homepageURL ?? this.plugin?.homepage;
      return typeof url === "string" ? url : "";
    },
    issueTracker(): string {
      const url = this.plugin?.issueTracker;
      return typeof url === "string" ? url : "";
    },
  },
  methods: {
    save() {
      if (!this.plugin) return;
      saveJS(
        this.plugin.code ?? "",
        this.plugin.filename ||
          `${sanitizeFileName(this.plugin.name ?? "")}.user.js`,
      );
    },
  },
});
</script>

<style scoped>
.sheet {
  position: absolute;
  inset: 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background: rgba(0, 0, 0, 0.45);
}
.sheet__panel {
  position: relative;
  display: flex;
  flex-direction: column;
  max-height: 88%;
  overflow: hidden;
  background: var(--surface);
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.2);
  --plugin-info-name-size: 16px;
}
.sheet__scroll {
  flex: 1;
  min-height: 0;
}
.sheet__body {
  padding: 16px;
}
.sheet__close {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--on-surface-variant);
  cursor: pointer;
}
.sheet__close:hover {
  background: var(--state-hover);
}
.sheet__actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}
.sheet__btn {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 16px;
  gap: 8px;
  height: 40px;
  border: 0;
  border-radius: 10px;
  background: var(--surface-container-high);
  color: var(--on-surface);
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}
.sheet__btn:hover {
  filter: brightness(0.95);
}
@media (prefers-color-scheme: dark) {
  .sheet__btn:hover {
    filter: brightness(1.08);
  }
}
.sheet__btn .material-icons {
  font-size: 18px;
}
.sheet__btn--danger {
  background: var(--state-error);
  color: var(--sidebar-on-surface);
}

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.2s ease;
}
.sheet-enter-active .sheet__panel,
.sheet-leave-active .sheet__panel {
  transition: transform 0.25s ease;
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}
.sheet-enter-from .sheet__panel,
.sheet-leave-to .sheet__panel {
  transform: translateY(100%);
}
</style>
