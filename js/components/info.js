import { html } from 'https://unpkg.com/htm/preact/standalone.module.js';
import { COLUMN_TITLES } from '../services/columns.js';

export const InfoRow = ({
    columns
}) => html`<div class="combatant title">
        <div class="info">
            ${columns.map((column) => {
                return html`<div class=${column}>${COLUMN_TITLES[column] || column}</div>`;
            })}
        </div>
    </div>
`;