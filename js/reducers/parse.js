const getJob = (c) => {
    if (c.name.includes('(')) {
        if (c.name.includes('SC')) return 'SC';
        return 'PET';
    }
    return c.Job;
}

const parseCombatant = (totalDamage, highestDamage, memo) => (c) => {
    const dps = Number(c.DPS) + (memo?.[c.name]?.dps || 0);
    const damage = Number(c.damage) + (memo?.[c.name]?.damage || 0);
    const hits = Number(c.hits) || 0;
    const misses = Number(c.misses) || 0;
    const totalHits = (hits + misses) || 0;
    const crits = Number(c.crithits) || 0;

    const hitsTaken = Number(c.hitsTaken) || 0;
    const parry = Number(c.parryCount) || 0;
    const evade = Number(c.evadeCount) || 0;
    const block = Number(c.blockCount) || 0;
    const intimidate = Number(c.intimidateCount) || 0;

    const avgMulti = Number(c.avgMulti) || 0;

    const totalReceived = hitsTaken + parry + evade + block + intimidate;

    const [, maxHitName, maxHitValueText] = c.maxhit.match(/(.+)\-(\d+)/) || [, 'No Data', 0]

    return {
        name: c.name,
        job: getJob(c),
        dpc: (damage / totalDamage) || 0,
        critRate: (crits / totalHits) || 0,
        accuracy: (hits / Math.max(1, totalHits)) || 0,
        maxHitValue: Number(maxHitValueText) || 0,
        contribution: (100 * damage / highestDamage) || 0,
        petContribution: (100 * memo?.[c.name]?.damage / damage) || 0,
        owner: c.name.match(/\((.+)\)/)?.[1],

        parryRate: parry / totalReceived,
        blockRate: block / totalReceived,
        evadeRate: evade / totalReceived,
        avoidanceRate: 1 - (hitsTaken / totalReceived),

        dps,
        damage,
        hits,
        misses,
        maxHitName,
        avgMulti
    }
}

const parse = (data) => {
    const baseCombatants = Object.values(data.Combatant);
    const totalDPS = Number(data.Encounter.DPS);
    const totalDamage = Number(data.Encounter.damage);
    const highestDamage = Math.max(...baseCombatants.map(c => Number(c.damage)));

    const combatants = baseCombatants.map(parseCombatant(totalDamage, highestDamage)).sort((a,b) => b.damage - a.damage);

    const withoutPets = baseCombatants.filter(c => !c.name.includes('('));
    
    const indexedDamage = combatants.filter(c => c.owner).reduce((map, c) => ({
        ...map,
        [c.owner]: {
            dps: (map[c.owner]?.dps || 0) + c.dps,
            damage: (map[c.owner]?.damage || 0) + c.damage,
        }
    }), {});

    const mergedHighest = Math.max(...baseCombatants.map(c => Number(c.damage) + (indexedDamage[c.name]?.damage || 0)));

    const mergedCombatants = withoutPets.map(parseCombatant(totalDamage, mergedHighest, indexedDamage)).sort((a,b) => b.damage - a.damage);

    return {
        isActive: data.isActive,
        combatants,
        mergedCombatants,
        encounter: {
            name: data.Encounter.title,
            duration: data.Encounter.duration,
            damage: totalDamage,
            dps: totalDPS,
        },
        pcName: data.Encounter.pcName
    }
};

export const reduceParse = (state, data) => {
    if (!data?.Combatant) return {};

    if (state.current.isActive && !data.isActive) {
        return {
            history: [...state.history, {...state.current, date: Date.now()}],
            current: parse(data),
        }
    }

    return {
        history: state.history,
        current: parse(data),
    };
};