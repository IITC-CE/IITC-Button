// Fix for ingressmosaik plugin.
// This plugin uses Tampermonkey-specific feature to access site’s context
// instead of in the Greasemonkey/Extension/etc. context.
window.plugin = {};
window.plugin.missions = true;
