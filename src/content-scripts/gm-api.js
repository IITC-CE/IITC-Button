//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3
export const GM = function() {
  const cache = {};
  const defineProperty = Object.defineProperty;

  function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
      (
        c ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16)
    );
  }

  const makeFunc = (func, toString) => {
    defineProperty(func, "toString", {
      value: toString || "[Unknown property]"
    });
    return func;
  };
  window.GM = function(dataKey, tab_id, meta) {
    return {
      info: {
        script: meta
      },
      _getValueSync: function(key, default_value) {
        if (!this._access("getValue")) return undefined;

        const items = sessionStorage.getItem(dataKey + "_" + key);
        if (items !== null) {
          return JSON.parse(items);
        } else {
          return default_value;
        }
      },
      _setValueSync: function(key, value) {
        if (!this._access("setValue")) return undefined;
        sessionStorage.setItem(dataKey + "_" + key, JSON.stringify(value));
      },
      getValue: function(key, default_value) {
        return new Promise((resolve, reject) => {
          if (!this._access("getValue")) return reject;
          resolve(this._getValueSync(key, default_value));
        });
      },
      setValue: function(key, value) {
        return new Promise((resolve, reject) => {
          if (!this._access("setValue")) return reject;
          resolve(this._setValueSync(key, value));
        });
      },
      deleteValue: function(key) {
        return new Promise((resolve, reject) => {
          if (!this._access("deleteValue")) return reject;

          sessionStorage.removeItem(dataKey + key);
          resolve();
        });
      },
      listValues: function() {
        return new Promise((resolve, reject) => {
          if (!this._access("listValues")) return reject;

          let keys = [];
          let prelen = "Vm123".length;
          for (let key of Object.keys(sessionStorage)) {
            if (key.substr(0, prelen) === dataKey) {
              keys.push(key.substr(prelen + 1));
            }
          }
          resolve(keys);
        });
      },
      getResourceUrl: function() {
        return new Promise((resolve, reject) => {
          if (!this._access("getResourceUrl")) return reject;
        });
      },
      openInTab: function() {},
      notification: function() {},
      setClipboard: function() {},
      xmlHttpRequest: function(details) {
        let data = Object.assign(
          {
            uuid: uuidv4(),
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
            ontimeout: null
          },
          details
        );

        for (let key in data) {
          if (key.startsWith("on")) {
            data[key] = String(data[key]);
          }
        }

        data.tab_id = tab_id;

        cache[data.uuid] = details.onload;
        document.dispatchEvent(
          new CustomEvent("xmlHttpRequestBridge", {
            detail: data
          })
        );
      },
      _access: function(key) {
        return (
          meta.grant !== undefined &&
          meta.grant.some(permission => {
            return permission.substr(3) === key;
          })
        );
      },
      exportFunction: makeFunc((func, targetScope, { defineAs } = {}) => {
        if (defineAs && targetScope) targetScope[defineAs] = func;
        return func;
      }),
      createObjectIn: makeFunc((targetScope, { defineAs } = {}) => {
        const obj = {};
        if (defineAs && targetScope) targetScope[defineAs] = obj;
        return obj;
      }),
      cloneInto: makeFunc(obj => obj)
    };
  };
  document.addEventListener("onXmlHttpRequestHandler", function(e) {
    const detail = JSON.parse(atob(e.detail));
    const uuid = detail.uuid;
    const response = JSON.parse(detail.response);

    if (cache[uuid] !== undefined) {
      const callback = cache[uuid];
      callback(response);
    }
  });
};
