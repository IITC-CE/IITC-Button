//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };

  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

document.addEventListener('DOMContentLoaded', async function(){
  document.getElementById('clickInstallPlugin').innerText = _('clickInstallPlugin');
  document.getElementById('install').innerText = _('install');
  document.getElementById('code').innerText = _('loading');

  const url = new URL(window.location.href).searchParams.get("url");

  let code;
  try {
    code = await ajaxGet(url);
  } catch {
    document.getElementById('code').innerText = _('addressNotAvailable');
  }

  if (code) {
    const codeblock = document.getElementById("code");
		codeblock.innerHTML = escapeHtml(code);
    hljs.highlightBlock(codeblock);

    const meta = parse_meta(code);
    if (meta['name'] !== undefined) {

    	document.getElementById("addUserScript").classList.remove('hide');
    	document.getElementById("addUserScript-title").innerText = meta['name'];
    	const filename = url.substr(url.lastIndexOf("/") + 1);
			const btn_install = document.getElementById("install");
			btn_install.addEventListener("click", async () => {

        const message = _("addedUserScriptTo", [filename, meta['category']])+"\n";
				meta['filename'] = filename;
        const script = [{'meta': meta, 'code': code}];

				alert(message);
				await browser.runtime.sendMessage({'type': "addUserScripts", 'scripts': script});
				document.getElementById("addUserScript").classList.add('hide');
			}, false)
		}

  }
});