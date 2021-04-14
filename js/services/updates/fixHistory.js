export const fixHistory = () => {
    try {
        const history = JSON.parse(localStorage.getItem('history'));
    
        if (!history || !Array.isArray(history)) {
            return;
        }
    
        localStorage.setItem('history', JSON.stringify(history.map(enc => ({
            ...enc,
            combatants: enc.combatants.map(c => ({...c, dps: Math.floor(c.dps)}))
        }))))
    } catch (e) {
        // History broke, unfortunately needs to be reset
        localStorage.setItem('history', '[]')
    }
}