const updateFile = async (path) => {
    const response = await fetch(`http://rikuavelar.github.io/eoparse/${path}`);
    const text = response.text();

    fs.writeFileSync(path, text);
}

export const checkForUpdates = async (version = '???') => {
    if (typeof window.fs === 'undefined') {
        // Not running in the app
        return;
    }
    const lastVersion = localStorage.getItem('lastVersion') || 'N/A';

    if (lastVersion === version) return;

    localStorage.setItem('lastVersion', version);

    let hasUpdated = true;

    switch(lastVersion) {
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