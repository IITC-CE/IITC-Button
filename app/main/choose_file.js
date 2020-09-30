//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

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

const url_input = document.getElementById("url_input");
url_input.addEventListener("keyup", function(event) {
  if (event.key === "Enter") { loadByUrl(); }
});
const url_button = document.getElementById("url_button");
url_button.addEventListener("click", async function () {
  await loadByUrl();
}, false);

async function loadByUrl() {
  let url = url_input.value;
  url_button.classList.remove('active');

  let code = await ajaxGet(url);
  if (code) {
    let scripts = [];
    let message = '';
    const meta = parse_meta(code);
    let filename = url.substr(url.lastIndexOf("/")+1);

    if (meta === {} || meta['name'] === undefined) {
      message += _("notValidUserScript", filename)+"\n";
    } else {
      message += _("addedUserScriptTo", [filename, _(meta['category'])])+"\n";
      meta['filename'] = filename;
      scripts.push({'meta': meta, 'code': code})
    }

    alert(message);
    chrome.runtime.sendMessage({'type': "addUserScripts", 'scripts': scripts});
  } else {
    alert(_("addressNotAvailable"));
  }
  url_input.value = '';
  url_button.classList.add('active');
}

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
 * Validation UserScript and adding to IITC Button
*/
const processingFile = async (fileList) => {
  let scripts = [];
  let message = '';
  for (let i = 0; i < fileList.length; i++) {
    let file = fileList[i];

    try {
      const code = await readUploadedFileAsText(file);
      const meta = parse_meta(code);

      if (meta === {} || meta['name'] === undefined) {
        message += _("notValidUserScript", file['name'])+"\n";
      } else {
        message += _("addedUserScript", meta['name'])+"\n";
        meta['filename'] = file['name'];
        scripts.push({'meta': meta, 'code': code})
      }
    } catch (e) {
      message += _("errorReadingFile", file['name'])+"\n";
    }

  }
  alert(message);
  chrome.runtime.sendMessage({'type': "addUserScripts", 'scripts': scripts});
};

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

window.addEventListener('DOMContentLoaded', function() {
  document.getElementById('or').innerText = _('or');
  document.getElementById('dropJSHereOrClick').innerHTML = _('dropJSHereOrClick');
  document.getElementById('willBeOverwrittenByNewPlugin').innerText = _('willBeOverwrittenByNewPlugin');
})