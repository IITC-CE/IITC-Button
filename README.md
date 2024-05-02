IITC Button WebExtension
========================

[![Firefox Add-ons](https://img.shields.io/amo/v/iitc-button.svg?style=flat-square)](https://addons.mozilla.org/firefox/addon/iitc-button)[![Firefox Add-ons](https://img.shields.io/amo/users/iitc-button.svg?style=flat-square)](https://addons.mozilla.org/firefox/addon/iitc-button)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/febaefghpimpenpigafpolgljcfkeakn.svg?style=flat-square)](https://chrome.google.com/webstore/detail/violentmonkey/febaefghpimpenpigafpolgljcfkeakn)[![Chrome Web Store](https://img.shields.io/chrome-web-store/users/febaefghpimpenpigafpolgljcfkeakn.svg?style=flat-square)](https://chrome.google.com/webstore/detail/violentmonkey/febaefghpimpenpigafpolgljcfkeakn)
[![Translations](https://weblate.iitc.app/widgets/iitc-ce/-/iitc-button/svg-badge.svg)](https://weblate.iitc.app/projects/iitc-ce/iitc-button/)

Intel map of Ingress game with IITC-CE in your browser.

Get it on [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/iitc-button) and [Chrome Web Store](https://chrome.google.com/webstore/detail/iitc-button/febaefghpimpenpigafpolgljcfkeakn)

---

> IITC is a browser add-on that modifies the Ingress intel map. It is faster than the standard site, and offers many more features. It is available for desktop browsers, such as Firefox and Chrome, and as a mobile application.

###### [IITC-CE Website](https://iitc.app/) | [IITC-CE Repository](https://github.com/IITC-CE/ingress-intel-total-conversion) | [News in Telegram](https://teleg.run/iitc_news) | [Discuss on Reddit](https://www.reddit.com/r/IITC/)

---

### What is it and what does it do?

Basically, Intel Ingress Total Conversion scripts allows to you to run Intel map of Ingress game with additional useful feature an a better overall experience. It consumes less resources than unmodified Intel, loads and run faster. It is also powered with useful custom plugins, which provide additional information.

### Why this extension is better

This extensions launch Intel Ingress Total Conversion in few seconds after installation. Installing plugins is easier than ever.

### It`s totally safe!

Theoretically, you violates ToS, but as you totally relies on intel.ingress.com API, you use just Intel site. All other modifications (UI, Plugin features, etc.) modifies only your browser view! It's like adblock activated in your browser.

---

## Project setup
```
npm install
```

### Compiles and minifies for production with Manifest V2
```
npm run build_mv2
```

### Compiles and minifies for production with Manifest V3
```
npm run build_mv3_firefox
# or
npm run build_mv3_chrome
# or
npm run build_mv3_safari
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

---

## Build for Safari (MacOS and iOS)

1. Follow the [general build instructions](#project-setup).
To build for iOS, set the _BROWSER="safari-ios"_ environment variable (example: `BROWSER="safari-ios" npm run build`). Tested only on Manifest V2.

2. Open the Xcode project in the `safari` folder

3. Click run in the top of Xcode

4. [Configure Safari in macOS to Run Unsigned Extensions](https://developer.apple.com/documentation/safariservices/safari_web_extensions/running_your_safari_web_extension#see-also).
To develop without a certificate, tell Safari to load unsigned extensions using the Develop menu. To enable the Develop menu in Safari:
   * Choose Safari > Preferences.
   * Select the Advanced tab.
   * Check the “Show Develop menu in menu bar” option.
   * Then, choose Develop > Allow Unsigned Extensions. The Allow Unsigned Extensions setting is reset when you quit Safari; set it again the next time you launch Safari.

5. Now enable the extension
   * Choose Safari > Preferences.
   * Select the Extensions tab. This tab shows the localized description, display name, and version number for the selected Safari App Extension. It also provides more information about the permissions claimed by the extension.
   * Find your new extension in the list on the left, and enable it by selecting the checkbox.

