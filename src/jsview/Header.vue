<template>
  <div class="addUserScript-wrapper">
    <div id="addUserScript" class="col" v-bind:class="{ hide: !show_header }">
      <div class="row">
        <div class="col">
          <img class="plugin__icon" :src="getIcon" v-if="getIcon" />
        </div>
        <div class="col">
          <h3>{{ meta.name }}</h3>
          <span v-if="meta.version" class="version">v{{ meta.version }}</span>
        </div>
      </div>
      <span class="description">{{ meta.description }}</span>

      <div class="row simple-details">
        <span class="label" v-if="domains === null">{{
          _("jsViewDetailsNoDomains")
        }}</span>
        <span class="label" v-if="domains === '<all_domains>'">{{
          _("jsViewDetailsAllDomains")
        }}</span>
        <template v-if="typeof domains === 'object'">
          <span class="label">{{ _("jsViewDetailsDomainsLabel") }}</span>
          <span class="value" v-for="(domain, i) in domains" v-bind:key="i">
            {{ domain }}</span
          >
        </template>
      </div>

      <div class="row details" :class="{ opened: show_details }">
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
      <a href="#" class="btn-more" @click.prevent="on_show_details">
        {{
          show_details
            ? _("jsViewDetailsHideDetails")
            : _("jsViewDetailsShowDetails")
        }}
      </a>

      <div id="install" class="btn" @click="install">{{ button_name }}</div>
    </div>
  </div>
</template>

<script>
import { _ } from "@/i18n";
import { getUID, humanize_match } from "lib-iitc-manager";

export default {
  name: "Header",
  props: {
    meta: Object,
    code: String
  },
  data() {
    return {
      show_header: false,
      button_name: _("install"),
      domains: null,
      show_details: false
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
              self.button_name = _("reinstall");
            });
        }
      });
    },
    on_show_details: async function() {
      this.show_details = !this.show_details;
      await browser.storage.local.set({
        js_view_show_details: this.show_details
      });
    }
  },
  watch: {
    meta: function() {
      this.domains = humanize_match(this.meta);
    },
    code: async function() {
      this.show_header = true;
      this.setListeners();
      await this.checkIfInstalled();
    }
  },
  computed: {
    getIcon: function() {
      return this.meta["icon64"] || this.meta["icon"] || null;
    }
  },
  async mounted() {
    browser.storage.local.get(["js_view_show_details"]).then(data => {
      if (data["js_view_show_details"] === true) {
        this.show_details = true;
      }
    });
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

.details {
  font-size: 12px;
  height: 0;
  flex-wrap: wrap;
  overflow: hidden;
  transition: margin 0.1s ease-in-out;
}

.details.opened {
  margin: 10px 0;
  height: auto;
}

.details .item {
  margin-top: 5px;
}

.details .item span {
  margin-right: 20px;
}

.details .label {
  font-weight: bold;
  margin-bottom: 5px;
}

.simple-details {
  font-size: 12px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.simple-details .label {
  padding: 5px 15px 5px 0;
  margin: 2px 0;
}

.simple-details .value {
  background: rgba(0, 0, 0, 0.3);
  padding: 5px 8px;
  border-radius: 3px;
  color: inherit;
  text-decoration: none;
  margin: 2px 4px 2px 0;
}

.btn-more {
  margin: 4px auto 0 0;
  font-size: 13px;
  color: #fff;
}

.plugin__icon {
  height: 48px;
  margin-right: 15px;
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
