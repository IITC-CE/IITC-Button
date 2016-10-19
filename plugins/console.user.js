// ==UserScript==
// @id             iitc-plugin-console@hansolo669
// @name           IITC plugin: console
// @category       Debug
// @version        0.1.1
// @namespace      https://github.com/hansolo669/iitc-tweaks
// @updateURL      https://iitc.reallyawesomedomain.com/console.meta.js
// @downloadURL    https://iitc.reallyawesomedomain.com/console.user.js
// @description    Utility to pipe the standard console back into IITC and easily eval snippets
// @include        https://*.ingress.com/intel*
// @include        http://*.ingress.com/intel*
// @match          https://*.ingress.com/intel*
// @match          http://*.ingress.com/intel*
// @include        https://*.ingress.com/mission/*
// @include        http://*.ingress.com/mission/*
// @match          https://*.ingress.com/mission/*
// @match          http://*.ingress.com/mission/*
// @grant          none
// ==/UserScript==

function wrapper(plugin_info) {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};

// PLUGIN START ////////////////////////////////////////////////////////
window.plugin.console = {};
window.plugin.console.history = [];
window.plugin.console.commands = [];
window.plugin.console.commandsidx = 0;
window.tools.to_array = function(array) {
  return Array.prototype.slice.apply(array);
}

var setup = function() {
    //add options menu
    $('#toolbox').append('<a onclick="window.plugin.console.open();return false;" title="console">console</a>');
    var oldConsole = console;
    window.console = {
        _log: function(args) {
            var history = window.plugin.console.history;
            history.push(Array.prototype.slice.call(args).map(function(x) {
                if (typeof x === 'object') {
                    var seen = [];
                    return JSON.stringify(x, function(key, val) {
                        if (val != null && typeof val == 'object') {
                            if (seen.indexOf(val) >= 0 || seen.length > 10) return;
                            seen.push(val);
                        }
                        return val;
                    }, ' ');
                }
                return x;
            }).join(" ") + '\n');
            var out = document.querySelector('#out');
            if (out) {
                out.textContent += history[history.length-1];
                var scroll = out.scrollHeight - out.offsetHeight;
                var scrolltop = out.scrollTop;
                if (!(scrolltop < scroll - 100 && scroll > 100)) {
                    out.scrollTop = out.scrollHeight;
                }
            }
        },
        log: function() {
            this._log(arguments);
            oldConsole.log.apply(oldConsole, arguments);
        },
        info: function() {
            this._log(arguments);
            oldConsole.info.apply(oldConsole, arguments);
        },
        error: function() {
            this._log(arguments);
            oldConsole.error.apply(oldConsole, arguments);
        },
        warn: function() {
            this._log(arguments);
            oldConsole.warn.apply(oldConsole, arguments);
        },
        debug: function () { this.log.apply(this, arguments); },
        exception: function() { this.error.apply(this, arguments); }
    };

    var utils = {
        echo: function() {
            if (arguments[1].search(/\w+\(*\)/i) != -1) {
                return eval(arguments[1]);
            }
            return arguments[1];
        },
        split: function() {// splits a string(arg2) with a delimiter(arg1)
            return arguments[2].split(arguments[1]);
        },
        join: function() {// joins an array(arg2) with a delimiter(arg1)
            // try to parse the array
            try { arguments[2] = JSON.parse(arguments[2]) } catch(e) {};
            return arguments[2].join(arguments[1]);

        },
        scores: function() {
            if (arguments[1]) {
                regionScoresAtRegion(arguments[1]);
            } else {
                regionScoreboard();
            }
        },
        checkpoint: function() {
            if (arguments[1]) {
                var checkpoints = 'the next ' + arguments[1] + ' checkpoints are: \n';
                for (var i = 0; i < arguments[1]; i++) {
                    checkpoints += unixTimeToString(nextCheckpoint() + (i*18000000), true) + '\n';
                }
                return checkpoints;
            }
            return formattedTimeToCheckpoint(nextCheckpoint());
        },
        cp: function() { return this.checkpoint.apply(this, Array.prototype.slice.call(arguments)); },
        help: function() {
            return this[arguments[1]].help();
        }
    };
    // command help definitions
    utils.echo.help = function() { return " echo [a] - echos the argument [a]"; };
    utils.split.help = function() { return "split [d, s] - splits string [s] by delimiter [d]"};
    utils.join.help = function() { return "join [s, a] - joins array [a] with string [s]"};
    utils.scores.help = function() { return "scores [r] - either displays scores for the current region, or for region [r]"; };
    utils.checkpoint.help = function() { return "checkpoint [n] - calculates either the time to the next checkpoint \n or the times of the next [n] checkpoints. \n aliased as cp."; };
    utils.cp.help = utils.checkpoint.help;
    utils.help.help = function() { return "help! help!"; };

    var parse_command = function(command) {
        var parts = command.split("|");
        parts = parts.map(function(x){
            return x.trim().match(/(\w+|\".*?\")/gi)
                .map(function(x){return x.replace(/\"/gi, "");});
        });
        //console.log(parts);
        if (!(parts[0][0] in utils)) return false;
        var ret = "";
        for (var i = 0; i < parts.length; i++) {
            if (parts[i][0] in utils) {
                parts[i].push(ret);
                ret = utils[parts[i][0]].apply(utils, parts[i]);
            }
        }
        // output
        console.log(ret);
        return true;
    };

    window.plugin.console.eval = function(ev) {
        if(ev.code === 'Enter') {
            var input = ev.target.value;
            ev.target.value = "";
            console.log(' -> ' + input);
            plugin.console.commands.push(input);
            plugin.console.commandsidx = 0;
            if(parse_command(input)) return;
            var res = '';
            try { res = eval(input) } catch(e) { res = e; }
            console.log(' <- ' + res);
        } else if(ev.code === 'ArrowUp') {
            var commands = plugin.console.commands;
            if(commands.length > 0) {
                if (plugin.console.commandsidx < commands.length) plugin.console.commandsidx++;
                ev.target.value = commands[commands.length-plugin.console.commandsidx];
            }
        } else if(ev.code === 'ArrowDown') {
            var commands = plugin.console.commands;
            if (commands.length > 0) {
                if (plugin.console.commandsidx >= 1) plugin.console.commandsidx--;
                if (plugin.console.commandsidx !== 0) {
                    ev.target.value = commands[commands.length-plugin.console.commandsidx];
                } else {
                    ev.target.value = '';
                }
            }
        }
    };

    window.plugin.console.open = function() {
        // to_array(tools.elems("script")).filter(function(script) { if(!script.attributes.src) return true; });
        var window = dialog({
            title:'console',
            html:'<div id="console-tabs">'
                 +'<ul><li><a href="#console-tab">console</a></li><li><a href="#editor-tab">editor</a></li></ul>' 
                 +'<div id="console-tab"><pre id="out" style="height:340px;width:100%;overflow:auto;"></pre>'
                 +'<input type="text" placeholder="command" onkeyup="window.plugin.console.eval(event)" style="width:100%;"/></div>'
                 +'<div id="editor-tab"><textarea id="code-editor" style="width:100%;height:350px;margin-top:10px;margin-bottom10px;"></textarea><button id="load-code">exec</button></div>'
                 +'</div>',
            width:700,
            minHeight:500
        });
        document.querySelector('#out').textContent = plugin.console.history.reduce(function(x, y) { return x += y; });
        $('#console-tabs').tabs();
        var out = document.querySelector('#out');
        out.scrollTop = out.scrollHeight - out.offsetHeight;
        document.querySelector('#load-code').addEventListener('click', function(ev) {
            eval(document.querySelector('#code-editor').value);
        });
    };
};
// PLUGIN END //////////////////////////////////////////////////////////
setup.info = plugin_info; //add the script info data to the function as a property
if(!window.bootPlugins) window.bootPlugins = [];
window.bootPlugins.push(setup);
// if IITC has already booted, immediately run the 'setup' function
if(window.iitcLoaded && typeof setup === 'function') setup();
} // wrapper end
// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = { 
    version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description };
script.appendChild(document.createTextNode('('+ wrapper +')('+JSON.stringify(info)+');'));
(document.body || document.head || document.documentElement).appendChild(script);
