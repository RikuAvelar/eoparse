import { reduceParse } from './parse.js';

const startingValues = JSON.parse(localStorage.getItem('settings')) ?? {};

export const getInitialState = () => ({
    isConnected: startingValues.isConnected ?? false,
    combinePets: startingValues.combinePets ?? true,
    hideNames: startingValues.hideNames ?? false,
    isHistoryOpen: false,
    history: [],
    columns: startingValues.columns ?? {
        name: true,
        dps: true,
        dpc: true,
        damage: true,
        critRate: true,
        avgMulti: true,
        accuracy: true,
        hits: false,
        misses: true,
        parryRate: false,
        blockRate: false,
        evadeRate: false,
        avoidanceRate: false,
        maxHit: true,
    },
    current: {
        combatants: [],
        mergedCombatants: [],
        encounter: {
            duration: '00:00',
            dps: 0,
            damage: 0
        }
    },
    currentHistoryPage: -1
});

export const main = (state, {type, payload}) => {
    switch(type) {
        case 'connected':
            return {...state, isConnected: true};
        case 'disconnected':
            return {...state, isConnected: false};
        case 'parse':
            return {...state, ...reduceParse(state, payload)}
        case 'updateColumns':
            return {...state, columns: {...state.columns, ...payload}}
        case 'updateCombine':
            return {...state, combinePets: payload}
        case 'updateNames':
            return {...state, hideNames: payload}
        case 'endEncounter':
            if (state.current.combatants.length) {
                return {...state, history: [...state.history, {...state.current, date: Date.now()}], current: getInitialState().current}
            }
            return state;
        case 'toggleHistory':
            return {...state, isHistoryOpen: !state.isHistoryOpen, currentHistoryPage: -1}
        case 'backHistory':
            if (state.currentHistoryPage > -1) {
                return {...state, currentHistoryPage: -1};
            } else {
                return {...state, isHistoryOpen: false, currentHistoryPage: -1}
            }
        case 'setCurrentPage':
            return {...state, currentHistoryPage: payload}
        default:
            return state;
    }
}