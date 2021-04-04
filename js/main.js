import { html, render } from 'https://unpkg.com/htm/preact/standalone.module.js';
import { MainParse } from './components/combatant.js';
import { HistoryPage } from './components/history.js';
import { compareCols } from './services/columns.js';
import { useParser } from './services/socket.js';
import { checkForUpdates } from './services/updater.js';

const currentVersion = window.VERSION;

checkForUpdates();

const App = () => {
    const {state, dispatch} = useParser(currentVersion);
    const columns = Object.entries(state.columns).filter(([, shown]) => shown).map(([col]) => col).sort(compareCols);
    const combatants = state.combinePets ? state.current.mergedCombatants : state.current.combatants;
    
    if (state.isHistoryOpen) {
        return HistoryPage({state, dispatch});
    } else {
        return MainParse({state, dispatch, combatants, columns, encounter: state.current.encounter});
    }
}

render(html`<${App} />`, document.body.querySelector('main'));