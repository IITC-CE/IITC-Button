//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

// XHR Handler for sandbox iframe
window.addEventListener("message", (event) => {
  if (event.data && event.data.type === "xhr_request") {
    const data = event.data;
    const req = new XMLHttpRequest();

    // Function to send response
    const sendResponse = (response) => {
      try {
        window.parent.postMessage(
          {
            type: "xhr_response",
            uuid: data.uuid,
            response: response,
          },
          "*"
        );
      } catch (error) {
        console.error("IITC Button XHR Sandbox: error sending response", error);
      }
    };

    // Event handlers
    req.onload = function () {
      sendResponse({
        readyState: this.readyState,
        responseHeaders: this.getAllResponseHeaders(),
        responseText: this.responseText,
        status: this.status,
        statusText: this.statusText,
      });
    };

    req.onerror = function () {
      sendResponse({
        readyState: this.readyState,
        status: 0,
        statusText: "Error",
        responseText: "",
        responseHeaders: "",
      });
    };

    req.ontimeout = function () {
      sendResponse({
        readyState: this.readyState,
        status: 0,
        statusText: "Timeout",
        responseText: "",
        responseHeaders: "",
      });
    };

    try {
      // Open connection
      req.open(data.method, data.url, true, data.user, data.password);

      // Set headers
      if (data.headers) {
        for (const [name, value] of Object.entries(data.headers)) {
          req.setRequestHeader(name, value);
        }
      }

      // Additional settings
      if (data.overrideMimeType) req.overrideMimeType(data.overrideMimeType);
      if (data.timeout) req.timeout = data.timeout;
      if (data.withCredentials) req.withCredentials = true;

      // Send request
      req.send(data.data);
    } catch (error) {
      sendResponse({
        readyState: 0,
        status: 0,
        statusText: "Error: " + error.message,
        responseText: "",
        responseHeaders: "",
      });
    }
  }
});
