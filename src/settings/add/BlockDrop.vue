<!-- @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3 -->
<template>
  <form
    class="zone"
    id="drop_zone"
    ref="fileform"
    v-on:drop="on_drop"
    v-on:click="$refs.input.click()"
  >
    <div>
      <span
        id="dropJSHereOrClick"
        class="drop_zone_label"
        v-html="_('dropJSHereOrClick')"
      ></span>
      <span
        id="willBeOverwrittenByNewPlugin"
        class="drop_zone_label drop_zone_label_small"
        v-html="_('willBeOverwrittenByNewPlugin')"
      ></span>
    </div>
    <input
      type="file"
      ref="input"
      accept="application/x-javascript"
      id="input"
      style="display: none"
      multiple
      v-on:change="handlePicked"
    />
  </form>
</template>

<script>
import browser from "webextension-polyfill";
import { parseMeta } from "lib-iitc-manager";
import { _ } from "@/i18n";

/*
 * Validation UserScript and adding to IITC Button
 */
const processingFile = async (fileList) => {
  const scripts = [];
  let message = "";
  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];

    try {
      const code = await readUploadedFileAsText(file);
      const meta = parseMeta(code);

      if (meta === {} || meta["name"] === undefined) {
        message += _("notValidUserScript", file["name"]) + "\n";
      } else {
        message +=
          _("addedUserScriptTo", [meta["name"], meta["category"]]) + "\n";
        meta["filename"] = file["name"];
        scripts.push({ meta: meta, code: code });
      }
    } catch (e) {
      message += _("errorReadingFile", file["name"]) + "\n";
    }
  }
  alert(message);
  await browser.runtime.sendMessage({
    type: "addUserScripts",
    scripts: scripts,
  });
};

const readUploadedFileAsText = (inputFile) => {
  const temporaryFileReader = new FileReader();

  return new Promise((resolve, reject) => {
    temporaryFileReader.onerror = () => {
      temporaryFileReader.abort();
      reject(new DOMException("Problem parsing input file."));
    };

    temporaryFileReader.onload = () => {
      resolve(temporaryFileReader.result);
    };
    temporaryFileReader.readAsText(inputFile);
  });
};

export default {
  name: "BlockDrop",
  data() {
    return {
      files: [],
    };
  },
  methods: {
    _: _,
    on_drop: (e) => {
      processingFile(e.dataTransfer.files).then();
    },
    handlePicked: (e) => {
      const target = e.target;
      processingFile(target.files).then();
    },
  },
  mounted() {
    [
      "drag",
      "dragstart",
      "dragend",
      "dragover",
      "dragenter",
      "dragleave",
      "drop",
    ].forEach(
      function (evt) {
        this.$refs.fileform.addEventListener(
          evt,
          function (e) {
            e.preventDefault();
            e.stopPropagation();
          }.bind(this),
          false
        );
      }.bind(this)
    );
    this.$refs.fileform.addEventListener(
      "drop",
      function (e) {
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
          this.files.push(e.dataTransfer.files[i]);
        }
      }.bind(this)
    );
  },
};
</script>

<style scoped>
.zone {
  border: 2px dashed #0087f7;
  border-radius: 5px;
  padding: 40px;
  width: 100%;
  box-sizing: border-box;
}

#drop_zone {
  cursor: pointer;
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 10px 50px rgba(0, 0, 0, 0.3);
  transition: background 0.2s linear;
}

#drop_zone:hover {
  background: #ddd;
}

.drop_zone_label {
  font-weight: 400;
  text-align: center;
  display: block;
}

.drop_zone_label_small {
  font-size: 14px;
  font-weight: 300;
  margin-top: 30px;
}
</style>
