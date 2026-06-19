<!-- @license Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE -->
<template>
  <form
    class="zone"
    id="drop_zone"
    ref="fileform"
    v-on:drop="on_drop"
    v-on:click="clickInput"
  >
    <div>
      <span
        id="dropJSHereOrClick"
        class="drop_zone_label"
        v-html="t('dropJSHereOrClick')"
      ></span>
      <span
        id="willBeOverwrittenByNewPlugin"
        class="drop_zone_label drop_zone_label_small"
        v-html="t('willBeOverwrittenByNewPlugin')"
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

<script lang="ts">
import browser from "webextension-polyfill";
import { parseMeta } from "lib-iitc-manager";
import { t } from "@/i18n";
import { readUploadedFileAsText } from "@/settings/utils";

/*
 * Validation UserScript and adding to IITC Button
 */
const processingFile = async (fileList: FileList) => {
  const scripts = [];
  let message = "";
  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];

    try {
      const code = (await readUploadedFileAsText(file)) as string;
      const meta = parseMeta(code);

      if (
        meta === null ||
        Object.keys(meta).length === 0 ||
        meta["name"] === undefined
      ) {
        message += t("notValidUserScript", file["name"]) + "\n";
      } else {
        message +=
          t("addedUserScriptTo", [meta["name"] ?? "", meta["category"] ?? ""]) +
          "\n";
        meta["filename"] = file["name"];
        scripts.push({ meta: meta, code: code });
      }
    } catch {
      message += t("errorReadingFile", file["name"]) + "\n";
    }
  }
  alert(message);
  await browser.runtime.sendMessage({
    type: "addUserScripts",
    scripts: scripts,
  });
};

export default defineComponent({
  name: "BlockDrop",
  data() {
    return {
      files: [] as File[],
    };
  },
  methods: {
    t: t,
    clickInput() {
      (this.$refs.input as HTMLInputElement).click();
    },
    on_drop: (e: DragEvent) => {
      processingFile(e.dataTransfer!.files).then();
    },
    handlePicked: (e: Event) => {
      processingFile((e.target as HTMLInputElement).files!).then();
    },
  },
  mounted() {
    const form = this.$refs.fileform as HTMLFormElement;
    [
      "drag",
      "dragstart",
      "dragend",
      "dragover",
      "dragenter",
      "dragleave",
      "drop",
    ].forEach((evt) => {
      form.addEventListener(
        evt,
        (e) => {
          e.preventDefault();
          e.stopPropagation();
        },
        false,
      );
    });
    form.addEventListener("drop", (e) => {
      const files = (e as DragEvent).dataTransfer!.files;
      for (let i = 0; i < files.length; i++) {
        this.files.push(files[i]);
      }
    });
  },
});
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
