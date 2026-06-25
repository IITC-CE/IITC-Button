<!-- @license Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE -->
<template>
  <div class="channel">
    <button
      class="channel__pill"
      :class="{ open: open }"
      :title="t('popupSelectedChannel', channelLabel)"
      v-on:click="toggle"
    >
      <span class="channel__name">{{ channelLabel }}</span>
      <i class="material-icons channel__chevron">expand_more</i>
    </button>
    <div class="channel__menu" v-if="open">
      <button
        v-for="opt in channelOptions"
        :key="opt.id"
        class="channel__option"
        :class="{ active: opt.id === channel }"
        v-on:click="selectChannel(opt.id)"
      >
        <span class="channel__option-name">{{ opt.name }}</span>
        <i v-if="opt.id === channel" class="material-icons channel__check">
          check
        </i>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import browser from "webextension-polyfill";
import { mixin } from "../mixins";

export default defineComponent({
  name: "ChannelStrip",
  mixins: [mixin],
  data() {
    return {
      channel: "",
      open: false,
    };
  },
  computed: {
    channelOptions(): { id: string; name: string }[] {
      return [
        { id: "release", name: this.t("release") },
        { id: "beta", name: this.t("beta") },
        { id: "custom", name: this.t("custom") },
      ];
    },
    channelLabel(): string {
      const opt = this.channelOptions.find((o) => o.id === this.channel);
      return opt ? opt.name : this.channel;
    },
  },
  methods: {
    toggle() {
      this.open = !this.open;
    },
    async selectChannel(channel: string) {
      this.open = false;
      if (channel === this.channel) return;
      this.channel = channel;
      await browser.runtime.sendMessage({ type: "setChannel", value: channel });
    },
    closeOnOutside(e: MouseEvent) {
      if (this.open && !this.$el.contains(e.target as Node)) {
        this.open = false;
      }
    },
    onChannelStorageChanged(
      changes: Record<string, browser.Storage.StorageChange>,
      areaName: string,
    ) {
      if (areaName !== "local" || !changes.channel) return;
      const newChannel = changes.channel.newValue;
      if (typeof newChannel === "string") this.channel = newChannel;
    },
  },
  async mounted() {
    document.addEventListener("click", this.closeOnOutside);
    browser.storage.onChanged.addListener(this.onChannelStorageChanged);
    const channel = await browser.runtime.sendMessage({ type: "getChannel" });
    if (typeof channel === "string") this.channel = channel;
  },
  beforeUnmount() {
    document.removeEventListener("click", this.closeOnOutside);
    browser.storage.onChanged.removeListener(this.onChannelStorageChanged);
  },
});
</script>

<style scoped>
.channel {
  position: relative;
  flex-shrink: 0;
}
.channel__pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 34px;
  padding: 0 8px 0 11px;
  border: 1px solid var(--outline);
  border-radius: 10px;
  background: var(--surface-container);
  color: var(--on-surface);
  font-family: inherit;
  cursor: pointer;
}
.channel__pill:hover,
.channel__pill.open {
  background: oklch(from var(--surface-container) calc(l - 0.05) c h);
}
.channel__name {
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}
.channel__chevron {
  font-size: 16px;
  color: var(--on-surface-variant);
  transition: transform 0.15s ease;
}
.channel__pill.open .channel__chevron {
  transform: rotate(180deg);
}
.channel__menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 20;
  min-width: 150px;
  padding: 4px;
  background: var(--surface-container);
  border: 1px solid var(--outline);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
}
.channel__option {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 10px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--on-surface);
  font-family: inherit;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
}
.channel__option:hover {
  background: oklch(from var(--surface-container) calc(l - 0.03) c h);
}
.channel__option.active {
  color: var(--accent-text);
  font-weight: 700;
}
.channel__option-name {
  flex: 1;
}
.channel__check {
  font-size: 16px;
  color: var(--accent-text);
}

@media (prefers-color-scheme: dark) {
  .channel__pill:hover,
  .channel__pill.open,
  .channel__option:hover {
    background: oklch(from var(--surface-container) calc(l + 0.05) c h);
  }
}
</style>
