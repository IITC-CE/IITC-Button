//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3
import JSZip from "jszip";

export const backup_json_name = "iitc.json";

export function formatDate(date) {
  const year = date.getFullYear();
  const month = padZero(date.getMonth() + 1);
  const day = padZero(date.getDate());
  const hours = padZero(date.getHours());
  const minutes = padZero(date.getMinutes());
  const seconds = padZero(date.getSeconds());

  return (
    year + "-" + month + "-" + day + "_" + hours + "." + minutes + "." + seconds
  );
}

function padZero(number) {
  if (number < 10) {
    return "0" + number;
  }
  return number;
}

export const saveAs = (blob, fileName) => {
  const link = document.createElement("a");
  // create a blobURI pointing to our Blob
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  // some browser needs the anchor to be in the doc
  document.body.append(link);
  link.click();
  link.remove();
  // in case the Blob uses a lot of memory
  setTimeout(() => URL.revokeObjectURL(link.href), 7000);
};

export const getBackupDataFromZip = async (file) => {
  const backup = {
    external_plugins: {},
    data: {},
  };
  const zip = await JSZip.loadAsync(file);

  for (const zipName in zip.files) {
    const zipEntry = zip.files[zipName];
    if (!zipEntry.dir) {
      const filename = zipEntry.name;
      const filename_split = filename.split("/");

      if (filename === backup_json_name) {
        // import iitc.json
        backup.data = JSON.parse(await zip.file(filename).async("string"));
      } else if (
        filename_split.length > 1 &&
        ["release", "beta", "custom"].includes(filename_split[0])
      ) {
        // import external plugins
        const channel = filename_split[0];
        const plugin_filename = filename_split[1];
        if (!Object.hasOwn(backup.external_plugins, channel)) {
          backup.external_plugins[channel] = {};
        }
        backup.external_plugins[channel][plugin_filename] = await zip
          .file(filename)
          .async("string");
      }
    }
  }
  return backup;
};

export const createBackupZip = async (backup) => {
  const zip = new JSZip();

  zip.file(backup_json_name, JSON.stringify(backup.data));

  for (const channel in backup.external_plugins) {
    for (const external_plugin_name in backup.external_plugins[channel]) {
      zip.file(
        `${channel}/${external_plugin_name}`,
        backup.external_plugins[channel][external_plugin_name]
      );
    }
  }

  const filename = "iitc-backup_" + formatDate(new Date()) + ".zip";
  zip.generateAsync({ type: "blob" }).then(function (content) {
    saveAs(content, filename);
  });
};
