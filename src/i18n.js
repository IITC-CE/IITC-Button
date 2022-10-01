//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

export function _(msg, arg) {
  return browser.i18n.getMessage(msg, arg);
}
