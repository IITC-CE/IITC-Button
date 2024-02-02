<!-- @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3 -->
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
          ? _('customServerTooltipSuccess')
          : _('customServerTooltipError', this.host + '/meta.json')
      "
      v-html="iconName"
    ></i>
    <p class="example">
      {{ _("customServerHint") }}
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

<script>
import { mixin } from "./mixins.js";

const checkStatusCustomServer = (host) =>
  new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `${host}/meta.json?${Date.now()}`, true);
    xhr.timeout = 1000;
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          resolve(true);
        } else {
          resolve(false);
        }
      }
    };
    xhr.send(null);
  });

export default {
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
    setInputStatus: async function (host) {
      this.iconName = "error";
      let status;
      try {
        status = await checkStatusCustomServer(host);
      } catch {
        status = false;
      }
      if (status) {
        this.iconName = "check";
      }
      return status;
    },
    changeCustomServer: async function () {
      let connected = await this.setInputStatus(this.host);

      const http_host = "http://" + this.host;
      if (
        !connected &&
        !this.host.startsWith("http") &&
        (await this.setInputStatus(http_host))
      ) {
        connected = await this.setInputStatus(http_host);
        this.host = http_host;
      }

      if (connected) {
        await browser.runtime.sendMessage({
          type: "setCustomChannelUrl",
          value: this.host,
        });
      }
    },
    setExample: function (host) {
      this.host = host;
      this.changeCustomServer();
    },
  },
  async mounted() {
    const network_host = await browser.storage.local
      .get(["network_host"])
      .then(({ network_host }) => network_host);

    if (network_host && network_host.custom) {
      this.host = network_host.custom;
    }
    await this.setInputStatus(this.host);
  },
};
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
