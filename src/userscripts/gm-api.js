//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

export const GM = function () {
  document.addEventListener("DOMContentLoaded", function () {
    if (window.location.hostname === "intel.ingress.com") {
      window.onload = function () {};
      document.body.onload = function () {};
    }
  });

  const cache = {};
  const defineProperty = Object.defineProperty;

  function base64ToStr(base64) {
    const binString = atob(base64);
    const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0));
    return new TextDecoder().decode(bytes);
  }

  function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
      (
        c ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16)
    );
  }

  function sendToBridge(data) {
    document.dispatchEvent(
      new CustomEvent("bridgeRequest", {
        detail: data,
      })
    );
  }

  // Storage object for caching values for synchronous access
  const storageObj = {};
  const storage = new Proxy(storageObj, {
    set: function (target, key, value) {
      const req = {
        task_type: "setValue",
        key: key,
        value: value,
      };
      sendToBridge(req);
      target[key] = value;
      return true;
    },
    deleteProperty: function (target, key) {
      const req = {
        task_type: "delValue",
        key: key,
      };
      sendToBridge(req);
      delete target[key];
    },
  });

  function initialSyncStorage() {
    const req = {
      task_uuid: uuidv4(),
      task_type: "getStorage",
    };
    sendToBridge(req);
  }

  const makeFunc = (func, toString) => {
    defineProperty(func, "toString", {
      value: toString || "[Unknown property]",
    });
    return func;
  };

  // Main GM API factory function
  window.GM = function (data_key, tab_id, meta) {
    initialSyncStorage();

    return {
      info: {
        script: meta,
      },

      // Synchronous methods - required for GM API v3 compatibility
      _getValueSync: function (key, default_value) {
        if (!this._access("getValue")) return undefined;

        const items = storage[data_key + "_" + key];
        return items !== undefined ? JSON.parse(items) : default_value;
      },

      _setValueSync: function (key, value) {
        if (!this._access("setValue")) return undefined;
        storage[data_key + "_" + key] = JSON.stringify(value);
      },

      // Asynchronous methods - GM API v4 style
      getValue: function (key, default_value) {
        return new Promise((resolve, reject) => {
          if (!this._access("getValue"))
            return reject(new Error("Permission denied"));
          resolve(this._getValueSync(key, default_value));
        });
      },

      setValue: function (key, value) {
        return new Promise((resolve, reject) => {
          if (!this._access("setValue"))
            return reject(new Error("Permission denied"));
          this._setValueSync(key, value);
          resolve();
        });
      },

      deleteValue: function (key) {
        return new Promise((resolve, reject) => {
          if (!this._access("deleteValue"))
            return reject(new Error("Permission denied"));

          delete storage[data_key + "_" + key];
          resolve();
        });
      },

      listValues: function () {
        return new Promise((resolve, reject) => {
          if (!this._access("listValues"))
            return reject(new Error("Permission denied"));

          let keys = [];
          let prelen = data_key.length;
          for (let key of Object.keys(storage)) {
            if (key.startsWith(data_key)) {
              keys.push(key.substring(prelen + 1));
            }
          }
          resolve(keys);
        });
      },

      getResourceUrl: function () {
        return new Promise((resolve, reject) => {
          if (!this._access("getResourceUrl"))
            return reject(new Error("Permission denied"));
          reject(new Error("Not implemented"));
        });
      },

      openInTab: function () {},
      notification: function () {},
      setClipboard: function () {},

      xmlHttpRequest: function (details) {
        if (!this._access("xmlhttpRequest")) {
          console.warn("IITC Button: XMLHttpRequest permission denied");
          return;
        }

        let data = Object.assign(
          {
            task_uuid: uuidv4(),
            task_type: "xmlHttpRequest",
            binary: false,
            context: {},
            data: null,
            headers: {},
            method: null,
            overrideMimeType: null,
            url: null,
            user: null,
            password: null,
            timeout: 0,
            onabort: null,
            onerror: null,
            onload: null,
            onprogress: null,
            onreadystatechange: null,
            ontimeout: null,
          },
          details
        );

        for (let key in data) {
          if (key.startsWith("on")) {
            data[key] = String(data[key]);
          }
        }

        data.tab_id = tab_id;

        cache[data.task_uuid] = {
          callback: details.onload,
        };

        sendToBridge(data);
      },

      // Permission check helper
      _access: function (key) {
        return (
          meta.grant !== undefined &&
          meta.grant.some((permission) => {
            return permission === `GM_${key}` || permission === `GM.${key}`;
          })
        );
      },

      // Helper functions
      exportFunction: makeFunc((func, targetScope, { defineAs } = {}) => {
        if (defineAs && targetScope) targetScope[defineAs] = func;
        return func;
      }),

      createObjectIn: makeFunc((targetScope, { defineAs } = {}) => {
        const obj = {};
        if (defineAs && targetScope) targetScope[defineAs] = obj;
        return obj;
      }),

      cloneInto: makeFunc((obj) => obj),
    };
  };

  // Response handler
  addEventListener("bridgeResponse", function (e) {
    try {
      const detail = JSON.parse(base64ToStr(e.detail));

      if (!detail.task_type) {
        console.warn("IITC Button: Invalid bridge response format");
        return;
      }

      switch (detail.task_type) {
        case "xmlHttpRequest": {
          const uuid = detail.task_uuid;
          if (!uuid || !cache[uuid]) return;

          const response = JSON.parse(detail.response);
          cache[uuid].callback(response);
          delete cache[uuid];
          break;
        }

        case "getStorage": {
          const storage_data = JSON.parse(detail.response);
          for (let key in storage_data) {
            if (storageObj[key] === undefined) {
              storageObj[key] = storage_data[key];
            }
          }
          break;
        }

        default:
          console.warn("IITC Button: Unknown response type", detail.task_type);
          break;
      }
    } catch (error) {
      console.error("IITC Button: Error processing bridge response", error);
    }
  });
};
