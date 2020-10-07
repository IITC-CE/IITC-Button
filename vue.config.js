module.exports = {
  pages: {
    popup: {
      template: "public/browser-extension.html",
      entry: "./src/popup/main.js",
      title: "IITC Button popup"
    },
    jsview: {
      template: "public/browser-extension.html",
      entry: "./src/jsview/main.js",
      title: "IITC Button view",
      filename: "jsview.html"
    },
    choose_file: {
      template: "public/browser-extension.html",
      entry: "./src/choose_file/main.js",
      title: "IITC Button choose file",
      filename: "choose_file.html"
    }
  },
  pluginOptions: {
    browserExtension: {
      componentOptions: {
        background: {
          entry: "src/background/background.js"
        },
        contentScripts: {
          entries: {
            "content-script": ["src/content-scripts/loader.js"]
          }
        }
      }
    }
  }
};
