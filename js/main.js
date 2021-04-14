import { html, render } from 'https://unpkg.com/htm/preact/standalone.module.js';
import { MainParse } from './components/combatant.js';
import { HistoryPage } from './components/history.js';
import { NotificationContainer } from './components/notifications.js';
import { compareCols } from './services/columns.js';
import { useParser } from './services/parse.js';
import { checkForUpdates } from './services/updater.js';


const currentVersion = '1.5.5';

checkForUpdates(currentVersion);

const App = () => {
    const {state, dispatch} = useParser(currentVersion);
    const columns = Object.entries(state.columns).filter(([, shown]) => shown).map(([col]) => col).sort(compareCols);
    const combatants = state.combinePets ? state.current.mergedCombatants : state.current.combatants;
    
    let mainPage = null;
    if (state.isHistoryOpen) {
        mainPage = HistoryPage({state, dispatch});
    } else {
        mainPage = MainParse({state, dispatch, combatants, columns, encounter: state.current.encounter});
    }

    return html`
        ${mainPage}
        <${NotificationContainer} notifications=${state.notifications} />
    `;
}

render(html`<${App} />`, document.body.querySelector('main'));