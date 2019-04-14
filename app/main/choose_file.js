// Listen for a file being selected through the file picker
const inputElement = document.getElementById("input");
inputElement.addEventListener("change", handlePicked, false);

// Listen for a file being dropped into the drop zone
const dropbox = document.getElementById("drop_zone");
dropbox.addEventListener("dragenter", dragenter, false);
dropbox.addEventListener("dragover", dragover, false);
dropbox.addEventListener("drop", drop, false);
dropbox.addEventListener("click", function () {
  document.getElementById("input").click();
}, false);

// Get the file if it was chosen from the pick list
function handlePicked() {
  processingFile(this.files);
}

// Get the file if it was dragged into the sidebar drop zone
function drop(e) {
  e.stopPropagation();
  e.preventDefault();

  processingFile(e.dataTransfer.files);
}

/*
 * Validation UserScript and adding to IITC-Button
*/
const processingFile = async (fileList) => {
  let scripts = [];
  let message = '';
  for (let i = 0; i < fileList.length; i++) {
    let file = fileList[i];

    try {
      const code = await readUploadedFileAsText(file);
      const meta = parse_meta(code);

      if (meta === {} || meta['id'] === undefined) {
        message += file['name']+" is not a valid UserScript.\n";
      } else {
        message += meta['name']+" has been added to the UserScripts category.\n";
        meta['filename'] = file['name'];
        scripts.push({'meta': meta, 'code': code})
      }
    } catch (e) {
      message += "An error occurred while reading "+file['name']+" file.\n";
    }

  }
  alert(message);
  chrome.runtime.sendMessage({'type': "addUserScripts", 'scripts': scripts});
};

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
      if (["name", "id", "version", "description", "updateURL", "supportURL"].indexOf(key) !== -1) {
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

const readUploadedFileAsText = (inputFile) => {
  const temporaryFileReader = new FileReader();

  return new Promise((resolve, reject) => {
    temporaryFileReader.onerror = () => {
      temporaryFileReader.abort();
      reject(new DOMException("Problem parsing input file."));
    };

    temporaryFileReader.onload = () => {
      resolve(temporaryFileReader.result);
    };
    temporaryFileReader.readAsText(inputFile);
  });
};

// Ignore the drag enter event - not used in this extension
function dragenter(e) {
  e.stopPropagation();
  e.preventDefault();
}

// Ignore the drag over event - not used in this extension
function dragover(e) {
  e.stopPropagation();
  e.preventDefault();
}