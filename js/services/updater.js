const updateFile = async (path) => {
    const response = await fetch(`http://rikuavelar.github.io/eoparse/${path}`);
    const text = await response.text();

    fs.writeFileSync(path, text);
}

export const checkForUpdates = async (version = '???') => {
    if (typeof fs === 'undefined') {
        // Not running in the app
        return;
    }

    const rawMain = await fetch('https://raw.githubusercontent.com/RikuAvelar/eoparse/master/js/main.js', {cache: 'no-store'});
    const rawMainText = await rawMain.text();
    const [,onlineVersion] = rawMainText.match(/const currentVersion\s+\=\s+['"](.+)['"].*/) ?? [];

    if (onlineVersion !== version) {
        // Needs a forced update right away
        window?.nw?.Window?.get()?.reloadIgnoringCache();
        return;
    }

    const lastVersion = localStorage.getItem('lastVersion') || 'N/A';

    if (lastVersion === version) return;

    localStorage.setItem('lastVersion', version);

    let hasUpdated = true;

    switch(lastVersion) {
        case '???':
        case 'N/A':
        case '1.1.1':
            await updateFile('./index.html');

            // Break on the last before default
            break;
        
        default:
            hasUpdated = false;
            break;
    }

    if (hasUpdated) {
        window?.nw?.Window?.get()?.reloadIgnoringCache();
    }
}