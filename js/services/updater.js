import { fixHistory } from "./updates/fixHistory.js";

const updateFile = async (path) => {
    const response = await fetch(`http://rikuavelar.github.io/eoparse/${path}`);
    const text = await response.text();

    fs.writeFileSync(path, text);
}

const earlierThan = (latest, ...versions) => versions.some(v => latest < v);

export const checkForUpdates = async (version = '???') => {
    if (typeof fs === 'undefined') {
        // Not running in the app
        return;
    }

    const rawMain = await fetch('https://raw.githubusercontent.com/RikuAvelar/eoparse/master/js/main.js', {cache: 'no-store'});
    const rawMainText = await rawMain.text();
    const [,onlineVersion] = rawMainText.match(/const currentVersion\s+\=\s+['"](.+)['"].*/) ?? [];

    if (onlineVersion > version) {
        // Needs a forced update right away
        window?.nw?.Window?.get()?.reloadIgnoringCache();
        return;
    }

    let lastVersion = localStorage.getItem('lastVersion') || 'N/A';

    if (lastVersion === version) return;

    localStorage.setItem('lastVersion', version);

    let requiresReload = false;

    if (lastVersion === '???' || lastVersion === 'N/A') {
        lastVersion = '0.0.0';
    }

    if (earlierThan(lastVersion, '1.1.1', '1.3.2')) {
        await updateFile('./index.html');
        requiresReload = true;
    }

    if (earlierThan(lastVersion), '1.5.2') {
        fixHistory();
        requiresReload = true;
    }

    if (requiresReload) {
        window?.nw?.Window?.get()?.reloadIgnoringCache();
    }
}