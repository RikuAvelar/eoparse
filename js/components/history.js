import { html, useState } from 'https://unpkg.com/htm/preact/standalone.module.js';
import { compareCols } from '../services/columns.js';
import { MainParse } from './combatant.js';
import { Header } from './header.js';
import { InfoRow } from './info.js';

import {format as timeago} from '../timeago.min.js';

export const HistoryPage = ({state, dispatch}) => {
    const currentPage = state.currentHistoryPage;
    const setCurrentPage = page => dispatch('setCurrentPage', page);

    if (currentPage === -1) {
        const columns = [
            'Encounter',
            'Time',
            'RDPS',
            'MyDPS'
        ]
        return html`
            <${Header} version=${state.version} isHistoryOpen=${state.isHistoryOpen} dispatch=${dispatch} columns=${state.columns} combinePets=${state.combinePets} hideNames=${state.hideNames} encounter=${{name: 'History'}} />
            <${InfoRow} columns=${columns} />
            <div class="history-container scroll-container">
                ${state.history.length === 0 ? html`
                    <div class="combatant">
                        <div class="info"><div>No data available</div></div>
                    </div>
                ` : state.history.map((log, index) => html`
                    <div key=${index} class="combatant history-entry" onclick=${() => setCurrentPage(index)}>
                        <div class="info">
                            <div class="encounter">${log.encounter.name} <em style="margin-left: 1em;" title=${new Date(log.date ?? Date.now()).toLocaleString()}>${timeago(log.date ?? Date.now())}</em></div>
                            <div class="time">${log.encounter.duration}</div>
                            <div class="RDPS">${log.encounter.dps}</div>
                            <div class="MyDPS">${log.combatants.find(({name}) => log.pcName)?.dps ?? 'N/A'}</div>
                        </div>
                    </div>
                `)}
            </div>
        `;
    } else {
        const columns = Object.entries(state.columns).filter(([, shown]) => shown).map(([col]) => col).sort(compareCols);
        const combatants = state.combinePets ? state.history[currentPage].mergedCombatants : state.history[currentPage].combatants;
        
        return html`
             <${MainParse} dispatch=${dispatch} state=${state} encounter=${state.history[currentPage].encounter} combatants=${combatants} columns=${columns} />
        `;
    }
}