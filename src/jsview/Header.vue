<template>
  <div class="addUserScript-wrapper">
    <div id="addUserScript" class="col" v-bind:class="{ hide: !show_header }">
      <div class="col">
        <h3>{{ meta.name }}</h3>
        <span v-if="meta.version" class="version">v{{ meta.version }}</span>
        <span class="description">{{ meta.description }}</span>
      </div>
      <div class="row info">
        <div
          v-for="(key, ki) in [
            'match',
            'include',
            'exclude-match',
            'exclude',
            'grant'
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
      <div id="install" class="btn" @click="install">{{ button_name }}</div>
    </div>
  </div>
</template>

<script>
import { _ } from "@/i18n";
import { getUID } from "lib-iitc-manager";

export default {
  name: "Header",
  props: {
    meta: Object,
    code: String
  },
  data() {
    return {
      show_header: false,
      button_name: _("install")
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
    },
    checkIfInstalled: async function() {
      console.log("checkIfInstalled", this.meta);
      await browser.runtime.sendMessage({
        type: "getPluginInfo",
        uid: getUID(this.meta)
      });
    },
    setListeners: function() {
      const self = this;
      browser.runtime.onMessage.addListener(function(request) {
        console.log("onMessage", request);
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
              self.button_name = _("reinstall");
            });
        }
      });
    }
  },
  watch: {
    code: async function() {
      this.show_header = true;
      this.setListeners();
      await this.checkIfInstalled();
    }
  }
};
</script>

<style src="../../public/assets/roboto/roboto-font.css"></style>

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

.info {
  font-size: 12px;
  margin-top: 15px;
  flex-wrap: wrap;
}

.info .item {
  margin-top: 5px;
}

.info .item span {
  margin-right: 20px;
}

.info .label {
  font-weight: bold;
  margin-bottom: 5px;
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
