//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

import { IITCButtonInitJS, isRunContentScript } from "@/content-scripts/utils";
import { setupBridges } from "@/content-scripts/bridge-manager";
import { IS_USERSCRIPTS_API } from "@/userscripts/env";
import { is_iitc_enabled } from "@/userscripts/utils";

export default defineContentScript({
  matches: ["<all_urls>"],
  runAt: "document_start",
  main() {
    function preparePage() {
      // Initialize all communication bridges
      setupBridges();

      if (IS_USERSCRIPTS_API) return;

      document.addEventListener(
        "IITCButtonInitJS",
        IITCButtonInitJS as unknown as EventListener,
      );
    }

    if (isRunContentScript) {
      window.iitcbutton = true;
      is_iitc_enabled().then((status) => {
        if (status) {
          preparePage();
        }
      });
    }
  },
});
