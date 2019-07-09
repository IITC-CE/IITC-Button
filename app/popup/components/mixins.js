let mixin = {
  methods: {
    '_': _,
    '__': function (key, item) {
      if ((item === undefined)||(!(key in item))) return '';
      let lang = chrome.i18n.getUILanguage();
      if ((key === 'name') && (item[key] === 'External')) {
        return _('external');
      }
      return ((key + ":" + lang) in item) ? item[key + ":" + lang] : item[key]
    },
    'objIsEmpty': function (obj) {
      return ((typeof obj !== 'object') || (Object.keys(obj).length === 0))
    },
    'openLink': function (url) {
      chrome.tabs.create({ url: url });
      window.close();
    },
    'back': function () {
      document.body.id = "main-menu";
    }
  }
}