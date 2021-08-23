//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3
export const GM = function() {
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
      getValue: function(key, default_value) {
        return new Promise((resolve, reject) => {
          if (!this._access("getValue")) return reject;
          resolve(this._getValueSync(key, default_value));
        });
      },
      setValue: function(key, value) {
        return new Promise((resolve, reject) => {
          if (!this._access("setValue")) return reject;

          sessionStorage.setItem(dataKey + "_" + key, JSON.stringify(value));
          resolve();
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
      }
    };
  };
  document.addEventListener("onXmlHttpRequestHandler", function(e) {
    function parseFunction(str) {
      var fn_body_idx = str.indexOf("{"),
        fn_body = str.substring(fn_body_idx + 1, str.lastIndexOf("}")),
        fn_declare = str.substring(0, fn_body_idx),
        fn_params = fn_declare.substring(
          fn_declare.indexOf("(") + 1,
          fn_declare.lastIndexOf(")")
        ),
        args = fn_params.split(",");
      args.push(fn_body);
      function Fn() {
        return Function.apply(this, args);
      }
      Fn.prototype = Function.prototype;
      return new Fn();
    }

    const detail = JSON.parse(e.detail);
    const callback = parseFunction(detail.callback);
    callback(detail.response);
  });
};
