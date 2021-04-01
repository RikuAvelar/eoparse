import { html } from 'https://unpkg.com/htm/preact/standalone.module.js';
import { COLUMNS } from '../services/columns.js';
import { Header } from './header.js';
import { InfoRow } from './info.js';

const formatNumber = (num) => num > 9999 ? new Intl.NumberFormat('en-US', {notation: 'compact', minimumSignificantDigits : 2, maximumSignificantDigits: 3 }).format(num) : num;
const formatPercent = (num) => num > 1 ? num.toFixed(1) : (num * 100).toFixed(1);

export const Combatant = (props) => {
    const {
        name,
        columns,
        job,
        maxHitValue,
        maxHitName,
        contribution,
        petContribution
    } = props;
    return html`<div class=${["combatant", job].join(' ')}>
            <div class="contribution" style=${{width: `${contribution}%`}}></div>
            <div class="contribution pet-contribution" style=${{width: `${contribution*petContribution/100}%`}}></div>
            <div class="info">
                ${columns.map((column) => {
                    if (column === 'maxHit') return html`<div class="maxHit"><span>${formatNumber(maxHitValue)}</span> <small>${maxHitName}</small></div>`;
                    if (COLUMNS[column] === 'number') return html`<div class=${column}>${formatNumber(props[column])}</div>`;
                    if (COLUMNS[column] === '%') return html`<div class=${column}>${formatPercent(props[column])}<em>%</em></div>`;
                    return html`<div class=${column}>${props[column]}</div>`;
                })}
            </div>
        </div>
    `;
}

export const MainParse = ({dispatch, state, encounter, combatants, columns}) => html`
    <${Header} version=${state.version} isHistoryOpen=${state.isHistoryOpen} dispatch=${dispatch} columns=${state.columns} combinePets=${state.combinePets} hideNames=${state.hideNames} encounter=${encounter} />
    ${combatants.length > 0 && html`<${InfoRow} columns=${columns} />`}
    ${combatants.map(({
            name,
            job,
            dps,
            dpc,
            damage,
            critRate,
            accuracy,
            maxHitValue,
            maxHitName,
            contribution,
            petContribution,
            parryRate,
            blockRate,
            evadeRate,
            avoidanceRate,
            hits,
            misses,
            avgMulti,
        }) => html`
        <${Combatant}
            key=${name}
            columns=${columns}
            name=${name}
            job=${job}
            dps=${dps}
            dpc=${dpc}
            damage=${damage}
            critRate=${critRate}
            accuracy=${accuracy}
            maxHitValue=${maxHitValue}
            maxHitName=${maxHitName}
            contribution=${contribution}
            petContribution=${petContribution}
            parryRate=${parryRate}
            blockRate=${blockRate}
            evadeRate=${evadeRate}
            avoidanceRate=${avoidanceRate}
            hits=${hits}
            misses=${misses}
            avgMulti=${avgMulti}
        />
    `)}
`