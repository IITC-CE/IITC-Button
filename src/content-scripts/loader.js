//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

import { IITCButtonInitJS } from "./utils";
import { bridgeAction } from "@/content-scripts/bridge";
import { inject_gm_api } from "@/userscripts/wrapper";
import { IS_USERSCRIPTS_API } from "@/userscripts/env";
import { is_iitc_enabled } from "@/userscripts/utils";

function preparePage() {
  document.addEventListener("bridgeRequest", bridgeAction);
  if (IS_USERSCRIPTS_API) return;

  inject_gm_api();
  document.addEventListener("IITCButtonInitJS", IITCButtonInitJS);
}

is_iitc_enabled().then((status) => {
  if (status) {
    preparePage();
  }
});
