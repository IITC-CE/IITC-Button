//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

import { inject } from "@/content-scripts/utils";

export async function bridgeAction(e) {
  const data = e.detail;

  async function xmlResponse(tab_id, callback, response) {
    const detail_stringify = JSON.stringify({
      task_uuid: data.task_uuid,
      task_type: data.task_type,
      response: JSON.stringify(response)
    });

    const injectedCode = `
  document.dispatchEvent(new CustomEvent('bridgeResponse', {
    detail: "${btoa(String(detail_stringify))}"
  }));
`;

    inject(injectedCode);
  }

  const req = new XMLHttpRequest();
  req.onload = function() {
    const response = {
      readyState: this.readyState,
      responseHeaders: this.responseHeaders,
      responseText: this.responseText,
      status: this.status,
      statusText: this.statusText
    };
    xmlResponse(data.tab_id, data.onload, response);
  };
  req.open(data.method, data.url, true, data.user, data.password);
  for (let [header_name, header_value] of Object.entries(data.headers)) {
    req.setRequestHeader(header_name, header_value);
  }

  req.send(data.data);
}
