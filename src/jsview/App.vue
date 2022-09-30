<!-- @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3 -->
<template>
  <div>
    <div class="addUserScript-wrapper">
      <div id="addUserScript" class="row" v-bind:class="{ hide: !show_header }">
        <div class="col">
          <h3>{{ plugin_name }}</h3>
          <span id="clickInstallPlugin">{{ _("clickInstallPlugin") }}</span>
        </div>
        <div id="install" class="btn">{{ _("install") }}</div>
      </div>
    </div>
    <Code :code="code" :status="status" />
  </div>
</template>

<script>
import Code from "./Code";
import { _, parseMeta } from "@/helpers";

export default {
  name: "App",
  components: {
    Code
  },
  data() {
    return {
      plugin_name: "",
      code: "",
      show_header: false,
      status: _("loading")
    };
  },
  methods: {
    _: _
  },
  async mounted() {
    const uniqId = new URL(window.location.href).searchParams.get("uniqId");
    const data = await browser.storage.local.get(uniqId);
    const { url, code } = data[uniqId];
    await browser.storage.local.remove(uniqId);

    this.code = code;
    this.show_header = true;

    const meta = parseMeta(code);
    if (meta["name"] !== undefined) {
      this.plugin_name = meta["name"];
      const filename = url.substr(url.lastIndexOf("/") + 1);
      const btn_install = document.getElementById("install");
      btn_install.addEventListener(
        "click",
        async () => {
          const message =
            _("addedUserScriptTo", [filename, meta["category"]]) + "\n";
          meta["filename"] = filename;
          const script = [{ meta: meta, code: code }];

          alert(message);
          await browser.runtime.sendMessage({
            type: "addUserScripts",
            scripts: script
          });
          this.show_header = false;
        },
        false
      );
    }
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
