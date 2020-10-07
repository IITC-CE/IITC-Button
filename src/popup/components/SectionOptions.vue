<!-- @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3 -->
<template>
  <div>
    <Header
      v-bind:header_text="_('iitcButtonOptions')"
      v-bind:button_text="_('updateNow')"
      v-on:button_onclick="forceUpdate"
    ></Header>
    <div class="settings-section">
      <h2>{{ _("choosingUpdateChannel") }}</h2>
      <p
        v-for="(item, index) in updateChannels"
        v-bind:key="index"
        class="input-field"
      >
        <input
          type="radio"
          v-bind:id="index"
          name="update-channel"
          v-bind:value="index"
          v-model="channelSelect"
        />
        <label v-bind:for="index">{{ item.name }}</label>
      </p>
    </div>
    <Hr />
    <div class="settings-section">
      <h2>{{ _("updateFrequency") }}</h2>
      <div class="input-field update-check">
        <div class="update-check__col">
          <UpdateCheckIntervalSelector
            v-bind:channel="'release'"
          ></UpdateCheckIntervalSelector>
          <UpdateCheckIntervalSelector
            v-bind:channel="'test'"
          ></UpdateCheckIntervalSelector>
        </div>
      </div>
    </div>
    <Hr />
    <div class="settings-section">
      <h2>{{ _("updateExternalFrequency") }}</h2>
      <div class="input-field update-check">
        <div class="update-check__col">
          <UpdateCheckIntervalSelector
            v-bind:channel="'external'"
          ></UpdateCheckIntervalSelector>
        </div>
      </div>
    </div>
    <Hr />
    <div class="settings-section">
      <h2>{{ _("localServerURL") }}</h2>
      <div class="input-field local-server">
        <InputLocalServerHost
          v-bind:channel="channel"
          v-on:requestUpdate="forceUpdate"
        ></InputLocalServerHost>
      </div>
    </div>
  </div>
</template>

<script>
import Hr from "./Hr.vue";
import Header from "./Header";
import UpdateCheckIntervalSelector from "./UpdateCheckIntervalSelector";
import InputLocalServerHost from "./InputLocalServerHost";

import { mixin } from "./mixins.js";

export default {
  name: "SectionOptions",
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
      set: async function(newValue) {
        this.$emit("update:channel", newValue);
        this.$root.channel = newValue;
        await browser.storage.local.set({
          channel: newValue
        });
        this.showMessage(this._("updateInProgress"));
        await this.forceUpdate();

        const data = await browser.storage.local.get([
          "release_categories",
          "test_categories",
          "local_categories",
          "release_plugins_flat",
          "test_plugins_flat",
          "local_plugins_flat"
        ]);

        // reinitialize categories
        this.$root.categories = data[newValue + "_categories"];

        // reinitialize all plugins
        this.$root.plugins_flat = data[newValue + "_plugins_flat"];
      }
    }
  },
  async mounted() {
    const data = await browser.storage.local.get("channel");
    if (data.channel) {
      this.channel = data.channel;
    }
  },
  components: { Hr, Header, UpdateCheckIntervalSelector, InputLocalServerHost }
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

.settings-section {
  padding: 15px 0;
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
}
.update-check__col {
  flex: auto;
  flex-direction: column;
  padding-right: 8px;
}

/*
   * local-server
   */
.local-server {
  display: flex;
}
.local-server__input {
  box-sizing: border-box;
  width: 50%;
  padding: 5px 3px;
  flex: auto;
  font-weight: 500;
  transition: color 0.2s linear;
}
.local-server__input__ok {
  color: var(--state-on);
}
.local-server__input__err {
  color: var(--state-off);
}
</style>
