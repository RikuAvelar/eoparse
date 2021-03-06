import { html, useState } from 'https://unpkg.com/htm/preact/standalone.module.js';
import { compareCols, COLUMN_TITLES } from '../services/columns.js';

const chatValueName = {
    p: 'Party',
    l1: 'Linkshell 1',
    l2: 'Linkshell 2'
}

export const Header = ({dispatch, announce, combatants, encounter, columns, hideNames, combinePets, isHistoryOpen, version}) => {
    const [modalIsOpen, setModal] = useState(false);
    return html`
        <header>
            ${isHistoryOpen ? html`
                <div class="icon back-arrow" onclick=${() => dispatch('backHistory')}>
                    <i class="material-icons">arrow_back</i>
                </div>
            ` : null}
            <div class="timer">${encounter?.duration === '00:00' ? '' : encounter?.duration}</div>
            <h2>${encounter?.name}<small>${encounter?.dps ? `RDPS - ${encounter?.dps}` : ''}</small></h2>
            <div class="icon minimize" onclick=${() => window?.nw?.Window?.get()?.minimize()}>
                <i class="material-icons">minimize</i>
                <span class="title">Minimize</span>
            </div>
            <div class="icon capture" onclick=${() => dispatch('capture')}>
                <i class="material-icons">camera</i>
            </div>
            <div class="icon announce" onclick=${() => dispatch('announce', {encounter, combatants})}>
                <i class="material-icons">connect_without_contact</i>
                <span class="title">Announce to ${chatValueName[announce.chat] || announce.chat}</span>
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
                <div class="double-row small">
                    <label>Version ${version}</label>
                    <label class="right-aligned">
                        <div class="icon reload" ondblclick=${() => window?.nw?.Window?.get()?.reloadIgnoringCache()}>
                            <i class="material-icons">refresh</i>
                            <span class="title">Double Click to Reload App</span>
                        </div>
                    </label>
                </div>
                <div class="double-row">
                    <label>
                        <span class="label select-label">Share to Chat: </span>
                        <div class="select">
                            <select value=${announce.chat} onchange=${({target: {value}}) => dispatch('updateAnnounceSettings', {chat: value})}>
                                <option value="p">Party</option>
                                <option value="l1">Linkshell 1</option>
                                <option value="l2">Linkshell 2</option>
                                <option value="echo">Echo</option>
                            </select>
                        </div>
                    </label>
                    <label>
                        <span class="label select-label">Chat Report Type: </span>
                        <div class="select">
                            <select value=${announce.type} onchange=${({target: {value}}) => dispatch('updateAnnounceSettings', {type: value})}>
                                <option value="full">Full</option>
                            </select>
                        </div>
                    </label>
                </div>
                <div class="double-row">
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
                </div>
                <div class="column-select">
                    ${Object.entries(columns).sort(([a],[b]) => compareCols(a, b)).map(([colName, isActive]) => html`
                        <label class="toggle">
                            <span class="label toggle-label">${COLUMN_TITLES[colName]}</span>
                            <input class="toggle-checkbox" type="checkbox" checked=${isActive} onchange=${() => dispatch('updateColumns', {[colName]: !isActive})} />
                            <div class="toggle-switch"></div>
                        </label>
                    `)}
                </div>
            </div>
        </div>
    `;
}