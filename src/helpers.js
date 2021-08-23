//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3
export let wait_timeout_id = null;

// Allow metadata lines to start with WHITESPACE? '//' SPACE
// Allow anything to follow the predefined text of the metaStart/End
// The SPACE must be on the same line and specifically \x20 as \s would also match \r\n\t
// Note: when there's no valid metablock, an empty string is matched for convenience
const METABLOCK_RE = /(?:^|\n)\s*\/\/\x20==UserScript==([\s\S]*?\n)\s*\/\/\x20==\/UserScript==|$/;

const META_ARRAY_TYPES = [
  "include",
  "exclude",
  "match",
  "excludeMatch",
  "require",
  "grant"
];

export function _(msg, arg) {
  return browser.i18n.getMessage(msg, arg);
}

export function parseMeta(code) {
  const meta = {};
  const metaBody = code.match(METABLOCK_RE)[1] || "";
  metaBody.replace(
    /(?:^|\n)\s*\/\/\x20(@\S+)(.*)/g,
    (_match, rawKey, rawValue) => {
      const [keyName, locale] = rawKey.slice(1).split(":");
      const camelKey = keyName.replace(/[-_](\w)/g, (m, g) => g.toUpperCase());
      const key = locale ? `${camelKey}:${locale.toLowerCase()}` : camelKey;

      let value = rawValue.trim();
      if (camelKey === "name") {
        value = value.replace("IITC plugin: ", "").replace("IITC Plugin: ", "");
      }
      if (META_ARRAY_TYPES.includes(key)) {
        if (typeof meta[key] === "undefined") {
          meta[key] = [];
        }
        meta[key].push(value);
      } else {
        meta[key] = value;
      }
    }
  );
  // @homepageURL: compatible with @homepage
  if (!meta.homepageURL && meta.homepage) meta.homepageURL = meta.homepage;
  return meta;
}

export const ajaxGet = (url, variant) =>
  new Promise((resolve, reject) => {
    const method = variant === "Last-Modified" ? "HEAD" : "GET";

    const xhr = new XMLHttpRequest();
    if (!xhr) return null;
    xhr.timeout = 10 * 1000;
    xhr.open(method, url + "?" + Date.now(), true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          if (variant === "Last-Modified") {
            resolve(xhr.getResponseHeader("Last-Modified"));
          } else {
            let response = xhr.responseText;
            if (variant === "parseJSON") {
              response = JSON.parse(response);
            }
            resolve(response);
          }
        } else {
          reject(null);
        }
      }
    };
    xhr.send(null);
  });

export function getUniqId(prefix = "VM") {
  const now = performance.now();
  return (
    prefix +
    Math.floor((now - Math.floor(now)) * 1e12).toString(36) +
    Math.floor(Math.random() * 1e12).toString(36)
  );
}

/* exported getUID */
export function getUID(plugin) {
  const available_fields = [];

  if (plugin["name"]) {
    available_fields.push(plugin["name"]);
  } else {
    available_fields.push(plugin["filename"]);
  }

  if (plugin["namespace"]) {
    available_fields.push(plugin["namespace"]);
  }

  return available_fields.join("+");
}

function check_url_match_pattern(url, domain) {
  if (
    (/^(http|https|\*):\/\/intel\.ingress\.com\//.test(url) ||
      /^(http|https|\*):\/\/(www|)\.ingress\.com\/intel/.test(url)) &&
    (domain === "<all>" || domain === "intel.ingress.com")
  )
    return true;

  if (
    /^(http|https|\*):\/\/missions\.ingress\.com\//.test(url) &&
    (domain === "<all>" || domain === "missions.ingress.com")
  )
    return true;

  return false;
}

// A simple check for a match Ingress sites.
// Far from implementing all the features of userscripts @match/@include ( https://violentmonkey.github.io/api/matching/ ),
// but sufficient for our needs.
export function check_meta_match_pattern(meta, domain = "<all>") {
  if (meta.match && meta.match.length) {
    for (const url of meta.match) {
      if (check_url_match_pattern(url, domain)) return true;
    }
  }
  if (meta.include && meta.include.length) {
    for (const url of meta.include) {
      if (check_url_match_pattern(url, domain)) return true;
    }
  }
  return false;
}

export async function wait(seconds) {
  return new Promise(resolve => {
    clearTimeout(wait_timeout_id);
    wait_timeout_id = null;
    wait_timeout_id = setTimeout(resolve, seconds * 1000);
  });
}

export function clearWait() {
  clearTimeout(wait_timeout_id);
  wait_timeout_id = null;
}
