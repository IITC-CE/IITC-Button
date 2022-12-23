<!-- @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3 -->
<template>
  <div>
    <div class="addUserScript-wrapper">
      <div id="addUserScript" class="row" v-bind:class="{ hide: !show_header }">
        <div class="col">
          <h3>{{ plugin_name }}</h3>
          <span id="clickInstallPlugin">{{ _("clickInstallPlugin") }}</span>
        </div>
        <div id="install" class="btn" @click="install">{{ button_name }}</div>
      </div>
    </div>
    <Code :code="code" :status="status" />
  </div>
</template>

<script>
import Code from "./Code";
import { getUID, parseMeta } from "lib-iitc-manager";
import { _ } from "@/i18n";

export default {
  name: "App",
  components: {
    Code
  },
  data() {
    return {
      button_name: _("install"),
      plugin_name: "",
      meta: {},
      code: "",
      filename: "",
      show_header: false,
      status: _("loading")
    };
  },
  methods: {
    _: _,
    install: async function() {
      const script = [{ meta: this.meta, code: this.code }];
      await browser.runtime.sendMessage({
        type: "addUserScripts",
        scripts: script
      });
      this.show_header = false;
    },
    checkIfInstalled: async function() {
      await browser.runtime.sendMessage({
        type: "getPluginInfo",
        uid: getUID(this.meta)
      });
    },
    setListeners: function() {
      const self = this;
      browser.runtime.onMessage.addListener(function(request) {
        switch (request.type) {
          case "resolveGetPluginInfo":
            if (request.info) {
              self.button_name = _("reinstall");
            }
            break;
          case "resolveAddUserScripts":
            Object.entries(request.scripts).map(([, script]) => {
              const message =
                _("addedUserScriptTo", [script["name"], script["category"]]) +
                "\n";
              alert(message);
            });
        }
      });
    }
  },
  async mounted() {
    const uniqId = new URL(window.location.href).searchParams.get("uniqId");
    const data = await browser.storage.local.get(uniqId);
    const { url, code } = data[uniqId];
    await browser.storage.local.remove(uniqId);

    this.code = code;
    this.show_header = true;

    const meta = parseMeta(code);
    if (meta["name"] === undefined) return;

    meta["filename"] = url.substr(url.lastIndexOf("/") + 1);
    this.meta = meta;
    this.plugin_name = meta["name"];

    this.setListeners();
    await this.checkIfInstalled();
  }
};
</script>

<style src="../../public/assets/roboto/roboto-font.css"></style>

<style>
body {
  background: #f0f0f0;
  margin: 0;
}
</style>

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
  margin: 0 0 0.7em 0;
}

.addUserScript-wrapper {
  background: #0e3d4e;
  color: #fff;
  border-bottom: 3px solid #316577;
}
#addUserScript {
  padding: 1.8em;
  margin: auto;
  width: 640px;
  height: 68px;
  font-size: 18px;
  transition: opacity 0.1s linear;
}
#addUserScript.hide {
  opacity: 0;
}
#addUserScript .col {
  padding-right: 10px;
}

.btn {
  cursor: pointer;
  padding: 10px 22px;
  background: #fff;
  color: #222;
  border-radius: 3px;
  display: inline-block;
  height: 22px;
  margin: auto;
}

.btn:hover {
  background: #efefef;
}
</style>
