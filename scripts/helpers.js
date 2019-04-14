function parse_meta(code) {
  let meta = code.split('\n');

  let is_userscript = false;
  let data = {};
  for (let i = 0; i < meta.length; i++) {
    let line = meta[i];
    if (line.indexOf("==UserScript==") > (- 1)) {
      is_userscript = true;
      continue;
    }
    if (line.indexOf("==/UserScript==") > (- 1)) {
        return data;
    }
    if (is_userscript) {
      line = line.trim();
      let sp = line.split(/\s+/);

      let key = sp[1].replace("@", "");
      let value = sp.slice(2).join(" ");
      if (["name", "id", "version", "description", "updateURL", "downloadURL", "supportURL"].indexOf(key) !== -1) {
        if (data[key]) continue;
        if (key === "description") key = "desc";
        if (key === "name") {
          value = value.replace("IITC plugin: ", "").replace("IITC Plugin: ", "");
        }
        data[key] = value;
      }
    }
  }
  return data;
}