import { useEffect, useRef, useReducer } from 'https://unpkg.com/htm/preact/standalone.module.js';
import { main, getInitialState } from '../reducers/main.js';
import { wrapDispatch } from '../utils/action.js';

import '../html2canvas.min.js';

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
        }
        wrappedDispatch(type, payload);
    }

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
            } catch (err) {
                console.log(err, e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('history', JSON.stringify(state.history.slice(-10)))
    }, [state.history]);

    useEffect(() => {
        localStorage.setItem('settings', JSON.stringify({
            isConnected: state.isConnected,
            combinePets: state.combinePets,
            hideNames: state.hideNames,
            columns: state.columns
        }))
    }, [state.isConnected, state.combinePets, state.hideNames, state.columns]);

    return {
        state,
        dispatch,
    }
}