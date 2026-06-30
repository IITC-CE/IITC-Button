<!-- @license Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE -->
<template>
  <div class="page">
    <header class="page-header">
      <div class="page-header-inner">
        <div>
          <div class="page-crumbs">{{ t("sidebarExtension") }}</div>
          <h1 class="page-title">{{ t("settings") }}</h1>
        </div>
        <div class="page-actions">
          <button class="btn-ghost" @click="forceUpdate">
            <i class="material-icons">schedule</i>
            {{ t("updateNow") }}
          </button>
        </div>
      </div>
    </header>

    <div class="page-scroll">
      <div class="page-inner">
        <section>
          <div class="block-head">
            <div class="block-title">{{ t("updateChannelTitle") }}</div>
            <div class="block-sub">{{ t("updateChannelHint") }}</div>
          </div>
          <div class="channel-grid">
            <button
              v-for="opt in channelOptions"
              :key="opt.id"
              class="channel-card"
              :class="{ active: channel === opt.id }"
              @click="selectChannel(opt.id)"
            >
              <div class="channel-card__head">
                <span class="channel-card__radio"></span>
                <span class="channel-card__name">{{ opt.name }}</span>
              </div>
              <div class="channel-card__sub">{{ opt.hint }}</div>
            </button>
          </div>

          <CustomServer v-if="channel === 'custom'" />
        </section>

        <section>
          <div class="block-head">
            <div class="block-title">{{ t("updateFrequencyTitle") }}</div>
            <div class="block-sub">{{ t("updateFrequencyHint") }}</div>
          </div>
          <div class="card">
            <div class="row">
              <i class="material-icons row__icon">schedule</i>
              <div class="row__text">
                <div class="row__title">{{ t("updateFrequency") }}</div>
              </div>
              <IntervalSelector
                v-show="channel === 'release'"
                :channel="'release'"
              />
              <IntervalSelector v-show="channel === 'beta'" :channel="'beta'" />
              <IntervalSelector
                v-show="channel === 'custom'"
                :channel="'custom'"
              />
            </div>
            <div class="row">
              <i class="material-icons row__icon">schedule</i>
              <div class="row__text">
                <div class="row__title">{{ t("updateExternalFrequency") }}</div>
              </div>
              <IntervalSelector :channel="'external'" />
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import browser from "webextension-polyfill";
import { t } from "@/i18n";
import CustomServer from "./CustomServer.vue";
import IntervalSelector from "./IntervalSelector.vue";

export default defineComponent({
  name: "PageOptions",
  components: { CustomServer, IntervalSelector },
  data() {
    return {
      channel: "release",
    };
  },
  computed: {
    channelOptions() {
      return [
        { id: "release", name: t("release"), hint: t("channelReleaseHint") },
        { id: "beta", name: t("beta"), hint: t("channelBetaHint") },
        { id: "custom", name: t("custom"), hint: t("channelCustomHint") },
      ];
    },
  },
  methods: {
    t: t,
    async forceUpdate() {
      await browser.runtime.sendMessage({ type: "forceFullUpdate" });
    },
    async selectChannel(channel: string) {
      this.channel = channel;
      await browser.runtime.sendMessage({ type: "setChannel", value: channel });
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
    browser.storage.onChanged.addListener(this.onChannelStorageChanged);
    const channel = await browser.runtime.sendMessage({ type: "getChannel" });
    if (channel) this.channel = channel as string;
  },
  beforeUnmount() {
    browser.storage.onChanged.removeListener(this.onChannelStorageChanged);
  },
});
</script>

<style scoped>
.channel-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.channel-card {
  text-align: left;
  padding: 16px 18px 14px;
  background: var(--surface-container);
  border: 1px solid var(--outline);
  border-radius: 14px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-family: inherit;
}

.channel-card.active {
  border: 1.5px solid var(--accent);
  background: var(--accent-container);
}

.channel-card__head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.channel-card__radio {
  width: 18px;
  height: 18px;
  box-sizing: border-box;
  border: 1.5px solid var(--on-surface-variant);
  border-radius: 50%;
  flex-shrink: 0;
  display: grid;
  place-content: center;
}

.channel-card.active .channel-card__radio {
  border-color: var(--accent);
  background: var(--accent);
}

/* White dot in both themes - it sits on the teal accent fill. */
.channel-card.active .channel-card__radio::after {
  content: "";
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ffffff;
}

.channel-card__name {
  font-size: 15px;
  font-weight: 600;
  color: var(--on-surface);
}

.channel-card__sub {
  font-size: 12.5px;
  color: var(--on-surface-variant);
}

.row__icon {
  font-size: 18px;
  color: var(--on-surface-variant);
  flex-shrink: 0;
}

.row__text {
  flex: 1;
  min-width: 0;
}

.row__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--on-surface);
}

@media (max-width: 720px) {
  .channel-grid {
    grid-template-columns: 1fr;
  }
}
</style>
