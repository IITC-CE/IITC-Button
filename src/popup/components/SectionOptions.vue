<!-- @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3 -->
<template>
  <div class="window">
    <Header
      v-bind:header_text="_('iitcButtonOptions')"
      v-bind:button_text="_('updateNow')"
      v-on:button_onclick="forceUpdate"
    ></Header>
    <div class="settings">
      <div class="settings__section">
        <h2>{{ _("choosingUpdateChannel") }}</h2>
        <div class="input-field channels">
          <div
            v-for="(item, index) in updateChannels"
            v-bind:key="index"
            class="channels__item"
          >
            <input
              type="radio"
              v-bind:id="index"
              name="update-channel"
              v-bind:value="index"
              v-model="channelSelect"
            />
            <label v-bind:for="index">{{ item.name }}</label>
          </div>
        </div>
      </div>
      <Hr />
      <div class="settings__section">
        <h2>{{ _("updateFrequency") }}</h2>
        <div class="input-field update-check">
          <UpdateCheckIntervalSelector
            v-bind:channel="'release'"
            v-show="channel === 'release'"
          ></UpdateCheckIntervalSelector>
          <UpdateCheckIntervalSelector
            v-bind:channel="'beta'"
            v-show="channel === 'beta'"
          ></UpdateCheckIntervalSelector>
          <UpdateCheckIntervalSelector
            v-bind:channel="'custom'"
            v-show="channel === 'custom'"
          ></UpdateCheckIntervalSelector>
        </div>
      </div>
      <div class="settings__section">
        <h2>{{ _("updateExternalFrequency") }}</h2>
        <div class="input-field update-check">
          <UpdateCheckIntervalSelector
            v-bind:channel="'external'"
          ></UpdateCheckIntervalSelector>
        </div>
      </div>
      <Hr />
      <div class="settings__section">
        <h2>{{ _("customServerURL") }}</h2>
        <div class="input-field">
          <InputCustomServer
            v-bind:channel="channel"
            v-on:requestUpdate="forceUpdate"
          ></InputCustomServer>
        </div>
      </div>
      <Hr />
      <div class="settings__section">
        <h2>{{ _("other") }}</h2>
        <div class="input-field">
          <div class="button" @click="openLink('/settings.html#backup')">
            {{ _("backup") }}
          </div>
        </div>
        <div class="input-field external-links">
          <div class="button" @click="openLink('https://iitc.app')">
            {{ _("iitcHomePage") }}
          </div>
          <div class="button" @click="openLink('https://iitc.app/donate')">
            {{ _("donate") }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Hr from "./Hr.vue";
import Header from "./Header";
import UpdateCheckIntervalSelector from "./UpdateCheckIntervalSelector";
import InputCustomServer from "./InputCustomServer";

import { mixin } from "./mixins.js";

export default {
  name: "settings__sectionOptions",
  data() {
    return {
      channel: "release"
    };
  },
  mixins: [mixin],
  methods: {
    forceUpdate: async function() {
      await browser.runtime.sendMessage({ type: "forceFullUpdate" });
      this.showMessage(this._("updateInProgress"));
    }
  },
  computed: {
    channelSelect: {
      get: function() {
        return this.channel;
      },
      set: async function(channel) {
        this.$emit("update:channel", channel);
        this.channel = channel;
        this.$root.channel = channel;
        await browser.runtime.sendMessage({
          type: "setChannel",
          value: channel
        });
      }
    }
  },
  async mounted() {
    const data = await browser.storage.local.get("channel");
    if (data.channel) {
      this.channel = data.channel;
    }
  },
  components: { Hr, Header, UpdateCheckIntervalSelector, InputCustomServer }
};
</script>

<style scoped>
/*
   * h2
   */
h2 {
  font-size: 1em;
  margin: 0;
  padding: 2px 12px 3px 10px;
}
h2:first-letter {
  text-transform: uppercase;
}

.window,
.settings {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.settings {
  justify-content: space-around;
}

/*
   * input-field
   */
.input-field {
  margin: 0;
  padding: 4px 12px 4px 10px;
}
.input-field label {
  vertical-align: super;
  margin-left: 8px;
  line-height: 26px;
}

/*
   * update-check
   */
.update-check {
  display: flex;
  flex-direction: column;
}

/*
   * Channels selector
   */
.channels {
  display: flex;
  flex-direction: row;
}
.channels__item {
  display: flex;
  flex: 1;
  height: 30px;
  justify-content: center;
}
.channels__item input {
  opacity: 0;
  position: absolute;
  z-index: -1;
  width: 0;
  height: 0;
}

.channels__item label {
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  padding: 0 10px 1px 10px;
  background: #eee;
  border: 1px solid #ccc;
  border-right: 0;
  width: 100%;
  margin: 0;
  line-height: 12px;
  text-align: center;
  transition: color 0.1s ease, background 0.1s ease, border 0.1s ease;
}
.channels__item:first-child label {
  border-radius: 4px 0 0 4px;
}
.channels__item:last-child label {
  border-right: 1px solid #ccc;
  border-radius: 0 4px 4px 0;
}
.channels__item input:checked + label {
  color: #fff;
  background: #555555;
  border-color: #555555;
}

.external-links {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.external-links .button {
  width: calc(50% - 5px);
  box-sizing: border-box;
  background: #555555;
  color: #fff;
  border: 1px solid #555;
}
</style>
