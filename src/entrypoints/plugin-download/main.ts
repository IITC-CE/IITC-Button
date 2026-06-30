// Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE
import browser from "webextension-polyfill";
import { t } from "@/i18n";
import "@/fonts/mulish/mulish-font.css";
import "@/styles/theme.css";
import "./style.css";
import type { PluginDownloadPayload } from "@/types/plugin-download";

function showError() {
  const title = document.getElementById("dl-title")!;
  title.textContent = t("pluginDownloadError");
  title.classList.add("dl-card__title--error");
}

function showStarted() {
  document.getElementById("dl-title")!.textContent = t("pluginDownloadStarted");
  document.getElementById("dl-subtitle")!.textContent = t(
    "pluginDownloadCloseTab",
  );
}

// Safari asks the user to allow downloads from this page on first use, so the
// tab is left open instead of being auto-closed - closing it before the user
// answers the prompt cancels the download.
async function run() {
  const key = new URLSearchParams(location.search).get("key");
  if (!key) return showError();

  const stored = await browser.storage.local.get(key);
  await browser.storage.local.remove(key);

  const payload = stored[key] as PluginDownloadPayload | undefined;
  if (!payload) return showError();

  const blob = new Blob([payload.code], { type: "application/x-javascript" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = payload.filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  showStarted();
}

run();
