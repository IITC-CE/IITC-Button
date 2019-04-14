// Fix for ingressmosaik plugin.
// This plugin uses Tampermonkey-specific feature to access site’s context
// instead of in the Greasemonkey/Extension/etc. context.
window.plugin = {};
window.plugin.missions = true;

// A simple solution for Firefox
if (window.wrappedJSObject) {
  window.PLAYER = window.wrappedJSObject.PLAYER;
} else {

  // Chrome does not provide access to WINDOW.
  // Old IITC code is used to retrieve user data.
  var scr = document.getElementsByTagName('script');
  for (var x in scr) {
    var s = scr[x];
    if (s.src) continue;
    if (s.type !== 'text/javascript') continue;
    var d = s.innerHTML.split('\n');
    break;
  }

  if (!d) {
    // page doesn’t have a script tag with player information.
    if (document.getElementById('header_email')) {
      // however, we are logged in.
      // it used to be regularly common to get temporary 'account not enabled' messages from the intel site.
      // however, this is no longer common. more common is users getting account suspended/banned - and this
      // currently shows the 'not enabled' message. so it's safer to not repeatedly reload in this case
      // setTimeout('location.reload();', 3*1000);
      throw("Page doesn't have player data, but you are logged in.");
    }
    // FIXME: handle nia takedown in progress
    throw("Couldn't retrieve player data. Are you logged in?");
  }

  for (var i = 0; i < d.length; i++) {
    if (!d[i].match('var PLAYER = ')) continue;
    eval(d[i]);
    break;
  }

}