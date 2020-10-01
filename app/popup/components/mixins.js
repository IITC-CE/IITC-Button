//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

const mixin = {
  methods: {
    '_': _,
    '__': function(key, item) {
      if ((item === undefined)||(!(key in item))) return '';
      const lang = browser.i18n.getUILanguage();
      return ((key + ":" + lang) in item) ? item[key + ":" + lang] : item[key]
    },
    'objIsEmpty': function(obj) {
      return ((typeof obj !== 'object') || (Object.keys(obj).length === 0))
    },
    'openLink': async function(url) {
      await browser.tabs.create({ url: url });
      window.close();
    },
    'back': function() {
      document.body.id = "main-menu";
    },
    'sortIITCObj': function(obj) {

      if (obj === undefined) {
        return {}
      }

      const arr = Object.keys(obj).map(key => obj[key]);

      for (let i=0;i<arr.length;i++) {
        for (let j=i+1; j<arr.length; j++) {
          if (this.__('name', arr[i]).toLowerCase() > this.__('name', arr[j]).toLowerCase()) {
            let swap = arr[i];
            arr[i] = arr[j];
            arr[j] = swap;
          }
        }
      }

      return arr;
    }
  }
}