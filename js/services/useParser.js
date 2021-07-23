import { useEffect, useRef, useReducer } from 'https://unpkg.com/htm/preact/standalone.module.js';
import { main, getInitialState } from '../reducers/main.js';
import { wrapDispatch } from '../utils/action.js';

import '../html2canvas.min.js';

const getShortList = (list) => [
    ...list.slice(0, 5).sort((a, b) => b.damage - a.damage),
    list.slice(5).reduce((merged, c, l) => ({
        name: 'Others',
        damage: merged.damage + c.damage,
        dps: merged.dps + c.dps,
        dpc: merged.dpc + c.dpc,
        accuracy: (merged.accuracy + c.accuracy) / l.length
    }), list[5] ?? null)
].filter(a => a)

export const useParser = (version = '???') => {
    const ws = useRef(null);

    const existingHistory = JSON.parse(localStorage.getItem('history')) || [];
    const [state, rawDispatch] = useReducer(main, {...getInitialState(version), history: existingHistory});
    const wrappedDispatch = wrapDispatch(rawDispatch);

    const dispatch = async (type, payload) => {
        switch(type) {
            case 'capture':
                // ws.current.send(JSON.stringify({msgtype: 'Capture'}))
                document.body.classList.add('screenshot');
                const canvas = await html2canvas(document.querySelector('main'));
                document.body.classList.remove('screenshot');
                
                ws.current.send(JSON.stringify({
                    msgtype: 'saveImage',
                    // title: state.
                    data: canvas.toDataURL('image/png').replace(/^data:image\/(png|jpg|jpeg);base64,/, '')
                }))
                
                canvas.toBlob((blob) => {
                    const data = [new ClipboardItem({'image/png': blob})]
                    navigator.clipboard.write(data);
                });

                break;
            case 'announce':
                ws.current.send(JSON.stringify({
                    msgtype: 'announce',
                    target: state.announce.chat,
                    lines: [
                        `========== ${payload.encounter.name} ==========`,
                        ...getShortList(payload.combatants).map(c => `${c.name.padEnd(15)} - ${c.dps} DPS (${(c.dpc * 100).toFixed(1)}%) ${!c.accuracy ? '' : `| Hit Rate: ${(c.accuracy * 100).toFixed(1)}%`}`)
                    ]
                }))
                break;
            case 'endEncounter':
                ws.current.send(JSON.stringify({
                    msgtype: 'endEncounter'
                }));
                break;
        }
        wrappedDispatch(type, payload);
    }

    useEffect(() => {
        const readLua = async () => {
            const rawMain = await fetch('https://raw.githubusercontent.com/RikuAvelar/eoparse/master/addon/eoparse.lua', {cache: 'no-store'});
            const rawMainText = await rawMain.text();
            const [,onlineLuaVersion] = rawMainText.match(/_addon\.version\s+\=\s+['"](.+)['"].*/) ?? [];

            dispatch('onlineLuaVersionLoaded', onlineLuaVersion)
        }

        readLua();
    }, [])

    useEffect(() => {
        const {onlineVersion, localVersion} = state.lua;
        if (localVersion && onlineVersion && onlineVersion > localVersion) {
            dispatch('addNotification', {
                id: 'newLuaRelease',
                icon: 'new_releases',
                action: () => window.require?.('nw.gui')?.Shell?.openExternal('https://github.com/RikuAvelar/eoparse/releases/latest'),
                message: `An update to the Eoparse Lua Addon is available to download (version ${onlineVersion})`
            })
        }
    }, [state.lua.localVersion, state.lua.onlineVersion])

    useEffect(() => {
        ws.current = new WebSocket('ws://127.0.0.1:10505/MiniParse');
        ws.current.onopen = () => {
            ws.current.send(JSON.stringify({type: 'set_id'}))
            dispatch('connected');
        }
        ws.current.onclose = () => dispatch('disconnected');

        return () => {
            ws.current.close();
        }
    }, []);

    useEffect(() => {
        ws.current.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);

                if (data.msgtype === 'CombatData') {
                    dispatch('parse', data.msg);
                }

                if (data.msgtype === 'luaConnected') {
                    dispatch('luaConnected', data.luaVersion);
                }
            } catch (err) {
                console.log(err, e);
            }
        }
    }, []);

    useEffect(() => {
        if (state.current.encounter.name && !state.lua.localVersion) {
            dispatch('luaConnected', '1.0.0');
        }
    }, [state.current.encounter.name])

    useEffect(() => {
        localStorage.setItem('history', JSON.stringify(state.history.slice(-50)))
    }, [state.history]);

    useEffect(() => {
        localStorage.setItem('settings', JSON.stringify({
            isConnected: state.isConnected,
            combinePets: state.combinePets,
            hideNames: state.hideNames,
            columns: state.columns,
            announce: state.announce
        }))
    }, [state.isConnected, state.combinePets, state.hideNames, state.columns, state.announce.chat, state.announce.type]);

    return {
        state,
        dispatch,
    }
}