import type {
  PluginsView,
  PluginDict,
  Channel,
  BackupParams,
  BackupData,
  UserScript,
  Plugin,
} from "lib-iitc-manager";
import type { XhrRequestData } from "./xhr";

// Messages sent to the background service worker
export type BackgroundMessage =
  | { type: "requestOpenIntel" }
  | { type: "toggleIITC"; value: boolean }
  | { type: "popupWasOpened" }
  | { type: "XHRFallbackRequest"; value: XhrRequestData }
  | { type: "getPluginsView" }
  | { type: "managePlugin"; uid: string; action: "on" | "off" | "delete" }
  | { type: "setChannel"; value: Channel }
  | { type: "safeUpdate" }
  | { type: "forceFullUpdate" }
  | { type: "addUserScripts"; scripts: UserScript[]; id?: string }
  | { type: "getPluginInfo"; uid: string }
  | { type: "getBackupData"; params: Partial<BackupParams> }
  | {
      type: "setBackupData";
      params: Partial<BackupParams>;
      backup_data: BackupData;
    }
  | { type: "checkUserScriptsApiAvailable" }
  | { type: "getChannel" }
  | { type: "getUpdateCheckInterval"; channel?: string }
  | { type: "getNetworkHost" }
  | { type: "setCustomChannelUrl"; value: string }
  | { type: "setUpdateCheckInterval"; interval: number; channel: string };

// Messages sent from background to popup/jsview/settings
export type FrontendMessage =
  | { type: "showMessage"; message: string }
  | { type: "showProgressbar"; value: boolean }
  | ({ type: "pluginsViewChanged" } & PluginsView)
  | { type: "resolveAddUserScripts"; id: string; scripts: PluginDict }
  | { type: "resolveGetPluginInfo"; info: Plugin | null }
  | { type: "resolveGetBackupData"; data: BackupData }
  | { type: "resolveSetBackupData"; data: void }
  | { type: "resolveCheckUserScriptsApiAvailable"; data: boolean };

// Messages sent to content scripts via browser.tabs.sendMessage
export type ContentScriptMessage = {
  type: "XHRFallbackResponse";
  value: string;
};

// Union of all runtime messages
export type ExtensionMessage =
  | BackgroundMessage
  | FrontendMessage
  | ContentScriptMessage;

// Bridge tasks dispatched from page context via CustomEvent("bridgeRequest")
export type BridgeTask =
  | ({ task_type: "xmlHttpRequest" } & XhrRequestData)
  | { task_type: "getStorage"; task_uuid?: string }
  | { task_type: "setValue"; key: string; value: unknown; task_uuid?: string }
  | { task_type: "delValue"; key: string; task_uuid?: string };
