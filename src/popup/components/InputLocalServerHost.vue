<!-- @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3 -->
<template>
  <input
    type="text"
    id="local-server__input__host"
    class="local-server__input local-server__input__host"
    placeholder="localhost:8000"
    v-bind:class="{
      'local-server__input__ok': localServerStatus === 'ok',
      'local-server__input__err': localServerStatus === 'err'
    }"
    v-model="localServerHost"
    v-on:input="changeLocalServer"
  />
</template>

<script>
const checkStatusLocalServer = host =>
  new Promise(resolve => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `http://${host}/meta.json?${Date.now()}`, true);
    xhr.timeout = 1000;
    xhr.onreadystatechange = function() {
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
  name: "InputLocalServerHost",
  props: {
    channel: String
  },
  data() {
    return {
      localServerHostDefault: "localhost:8000",
      localServerHost: String,
      localServerStatus: String
    };
  },
  methods: {
    setInputStatus: async function(host) {
      this.localServerStatus = "err";
      let status;
      try {
        status = await checkStatusLocalServer(host);
      } catch {
        status = false;
      }
      if (status) {
        this.localServerStatus = "ok";
      }
      return status;
    },
    changeLocalServer: async function(event) {
      const host = event.target.value;
      const status = await this.setInputStatus(host);

      if (status) {
        await browser.storage.local.set({
          local_server_host: host
        });

        if (this.channel === "local") {
          this.$emit("requestUpdate");
        }
      }
    }
  },
  async mounted() {
    const data = await browser.storage.local.get("local_server_host");
    this.localServerHost = this.localServerHostDefault;
    if (data.local_server_host) {
      this.localServerHost = data.local_server_host;
    }
    await this.setInputStatus(this.localServerHost);
  }
};
</script>

<style scoped></style>
