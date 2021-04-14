export const fixHistory = () => {
    const history = JSON.parse(localStorage.getItem('history'));

    if (!history || !Array.isArray(history)) {
        return;
    }

    localStorage.setItem('history', history.map(enc => ({
        ...enc,
        combatants: enc.combatants.map(c => ({...c, dps: Math.floor(c.dps)}))
    })))
}