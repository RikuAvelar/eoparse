export const COLUMNS = {
    name: 'text',
    dpc: '%',
    critRate: '%',
    accuracy: '%',
    maxHit: 'special',
    parryRate: '%',
    blockRate: '%',
    evadeRate: '%',
    avoidanceRate: '%',
    dps: 'number',
    damage: 'number',
    hits: 'text',
    misses: 'text',
    avgMulti: 'text'
}

export const COLUMN_TITLES = {
    name: 'Name',
    dpc: 'D%',
    critRate: 'Crit',
    accuracy: 'Acc',
    maxHit: 'MaxHit',
    parryRate: 'Parry',
    blockRate: 'Block',
    evadeRate: 'Evade',
    avoidanceRate: 'Avoid',
    dps: 'DPS',
    damage: 'Dmg',
    hits: 'Hits',
    misses: 'Miss',
    avgMulti: 'Multi'
}

export const COLUMN_ORDER = [
    'name',
    'dps',
    'dpc',
    'damage',
    'critRate',
    'avgMulti',
    'accuracy',
    'hits',
    'misses',
    'parryRate',
    'blockRate',
    'evadeRate',
    'avoidanceRate',
    'maxHit',
];

export const compareCols = (colA, colB) => COLUMN_ORDER.indexOf(colA) - COLUMN_ORDER.indexOf(colB);