<!-- @license Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE -->
<template>
  <form
    class="zone"
    id="drop_zone"
    ref="fileform"
    v-on:drop="on_drop"
    v-on:click="clickInput"
  >
    <div class="drop_zone__icon">
      <i class="material-icons">upload_file</i>
    </div>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <span
      id="dropJSHereOrClick"
      class="drop_zone_label"
      v-html="t('dropJSHereOrClick')"
    ></span>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <span
      id="willBeOverwrittenByNewPlugin"
      class="drop_zone_label drop_zone_label_small"
      v-html="t('willBeOverwrittenByNewPlugin')"
    ></span>
    <button type="button" class="btn-ghost drop_zone__btn">
      {{ t("browseFiles") }}
    </button>
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
  border: 1.5px dashed var(--outline-strong);
  border-radius: 14px;
  padding: 40px 24px;
  width: 100%;
  box-sizing: border-box;
  background: var(--surface-container);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  transition:
    border-color 0.15s linear,
    background 0.15s linear;
}

#drop_zone:hover {
  border-color: var(--accent-border);
  background: var(--accent-container);
}

.drop_zone__icon {
  width: 54px;
  height: 54px;
  margin-bottom: 14px;
  border-radius: 14px;
  background: var(--accent-container);
  color: var(--accent-text);
  display: grid;
  place-items: center;
}

.drop_zone__icon i {
  font-size: 26px;
}

.drop_zone_label {
  font-size: 15px;
  font-weight: 600;
  color: var(--on-surface);
  display: block;
}

.drop_zone_label :deep(i) {
  color: var(--accent-text);
  font-family: var(--font-mono);
  font-style: normal;
}

.drop_zone_label_small {
  font-size: 13px;
  font-weight: 400;
  color: var(--on-surface-variant);
  margin-top: 6px;
}

.drop_zone__btn {
  margin-top: 14px;
}
</style>
