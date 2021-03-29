import { html, useState } from 'https://unpkg.com/htm/preact/standalone.module.js';
import { compareCols, COLUMN_TITLES } from '../services/columns.js';

export const Header = ({dispatch, encounter, columns, hideNames, combinePets, isHistoryOpen}) => {
    const [modalIsOpen, setModal] = useState(false);
    return html`
        <header>
            ${isHistoryOpen ? html`
                <div class="icon back-arrow" onclick=${() => dispatch('backHistory')}>
                    <i class="material-icons">arrow_back</i>
                </div>
            ` : null}
            <div class="timer">${encounter?.duration}</div>
            <h2>${encounter?.name}<small>${encounter?.dps ? `RDPS - ${encounter?.dps}` : ''}</small></h2>
            <div class="icon capture" onclick=${() => dispatch('capture')}>
                <i class="material-icons">camera</i>
                <span class="title">Capture</span>
            </div>
            <div class="icon history" onclick=${() => dispatch('toggleHistory')}>
                <i class="material-icons">${isHistoryOpen ? 'history_toggle_off' : 'history'}</i>
                <span class="title">${isHistoryOpen ? 'Close History' : 'History'}</span>
            </div>
            <div class=${"icon end-encounter " + (isHistoryOpen ? 'hidden' : '')} onclick=${() => dispatch('endEncounter')}>
                <i class="material-icons">timer_off</i>
                <span class="title">End Encounter</span>
            </div>
            <div class="icon more-options" onclick=${() => setModal(!modalIsOpen)}>
                <i class="material-icons">more_vert</i>
                <span class="title">More</span>
            </div>
        </header>
        <div class=${"modal-options " + (modalIsOpen ? '' : 'hidden')} onclick=${() => setModal(false)}>
            <div class="option-container" onclick=${(evt) => evt.stopPropagation()}>
                <label class="toggle">
                    <span class="label toggle-label">Combine Pets</span>
                    <input class="toggle-checkbox" type="checkbox" checked=${combinePets} onchange=${() => dispatch('updateCombine', !combinePets)} />
                    <div class="toggle-switch"></div>
                </label>
                <label class="toggle">
                    <span class="label toggle-label">Hide Names</span>
                    <input class="toggle-checkbox" checked=${hideNames} onchange=${() => dispatch('updateNames', !hideNames)} type="checkbox" />
                    <div class="toggle-switch"></div>
                </label>
                <div class="column-select">
                    ${Object.entries(columns).sort(([a],[b]) => compareCols(a, b)).map(([colName, isActive]) => html`
                        <label class="toggle">
                            <input class="toggle-checkbox" type="checkbox" checked=${isActive} onchange=${() => dispatch('updateColumns', {[colName]: !isActive})} />
                            <div class="toggle-switch"></div>
                            <span class="label toggle-label">${COLUMN_TITLES[colName]}</span>
                        </label>
                    `)}
                </div>
            </div>
        </div>
    `;
}