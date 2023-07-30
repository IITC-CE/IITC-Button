<!-- @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3 -->
<template>
  <div class="zone url_zone">
    <div class="url_wrapper">
      <div
        id="url_button"
        class="url_button"
        v-bind:class="{ active: url }"
        v-on:click="loadByUrl"
      >
        »
      </div>
      <input
        id="url_input"
        type="url"
        placeholder="https://example.com/awesome-iitc-plugin.user.js"
        v-on:keyup="url_input_keyup"
        v-model="url"
      />
    </div>
  </div>
</template>

<script>
import { ajaxGet, parseMeta } from "lib-iitc-manager";
import { _ } from "@/i18n";

export default {
  name: "BlockURL",
  data() {
    return {
      url: ""
    };
  },
  methods: {
    _: _,
    url_input_keyup: async event => {
      if (event.key === "Enter") {
        await this.loadByUrl();
      }
    },
    loadByUrl: async function() {
      const url = this.url;
      this.url = "";

      let code;
      try {
        code = await ajaxGet(url);
      } catch {
        alert(_("addressNotAvailable"));
      }

      if (code) {
        const scripts = [];
        let message = "";
        const meta = parseMeta(code);
        const filename = url.substr(url.lastIndexOf("/") + 1);

        if (meta === {} || meta["name"] === undefined) {
          message += _("notValidUserScript", filename) + "\n";
        } else {
          message +=
            _("addedUserScriptTo", [filename, meta["category"]]) + "\n";
          meta["filename"] = filename;
          scripts.push({ meta: meta, code: code });
        }

        alert(message);
        await browser.runtime.sendMessage({
          type: "addUserScripts",
          scripts: scripts
        });
      }
    }
  }
};
</script>

<style scoped>
.url_zone {
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
}

#url_input {
  width: 100%;
  height: 45px;
  box-sizing: border-box;
  padding: 15px;
}

.url_wrapper {
  position: relative;
}

.url_button {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  line-height: 26px;
  padding: 7px 20px;
  border: 1px solid #717171;
  border-left: 0;
  border-radius: 0 2px 2px 0;
  font-size: 1.2em;
  color: #ffffff;
  cursor: pointer;
  background: #000000b3;
  transition: background 0.1s linear;
}

.url_button.active {
  color: #fff;
  background: #000000b3;
}

.url_button.active:hover {
  background: #000c;
}

@media (max-width: 900px) {
  .url_zone {
    width: 90%;
  }
}
</style>
