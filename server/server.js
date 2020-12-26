const WS = require('ws')

const createEmptyLog = (name) => ({
    "critheal%": "---",
    "DPS-m": "DPS-m",
    "healstaken-*": "0",
    "kills": "0",
    "maxheal": "",
    "ENCDPS-*": "0",
    "tohit": "0.00",
    "n": "\n",
    "dps-*": "dps-*",
    "damagetaken-*": "0",
    "healed": "0",
    "t": "\t",
    "powerdrain": "0",
    "DPS-k": "0",
    "DAMAGE-m": "0",
    "DAMAGE-k": "0",
    "DAMAGE-b": "0",
    "encdps-*": "0L",
    "cures": "0",
    "maxheal-*": "",
    "damage-m": "0",
    "ENCHPS-k": "0",
    "healstaken": "0",
    "damage-*": "0K",
    "deaths": "0",
    "ENCHPS-m": "0.00",
    "swings": "0",
    "CritDirectHitCount": "",
    "maxhealward-*": "",
    "misses": "0",
    "DPS-*": "0",
    "DAMAGE-*": "0K",
    "crithits": "0",
    "overHeal": "0",
    "critheals": "0",
    "duration": "00:00",
    "enchps": "0.00",
    "MAXHIT": "0",
    "ENCDPS-m": "0",
    "ENCDPS-k": "0",
    "ENCHPS": "0",
    "heals": "0",
    "Last60DPS": "0",
    "encdps": "0",
    "maxhit-*": "",
    "Job": "BSM",
    "name": name,
    "DirectHitPct": "",
    "powerheal-*": "0",
    "CritDirectHitPct": "",
    "DirectHitCount": "",
    "crithit%": " 0%",
    "enchps-*": "0",
    "MAXHEALWARD": "",
    "DURATION": "0",
    "maxhealward": "",
    "Last10DPS": "0",
    "CurrentZoneName": "",
    "powerheal": "0",
    "ENCDPS": "0",
    "damage": "0",
    "TOHIT": " 0",
    "damagetaken": "0",
    "MAXHEALWARD-*": "",
    "MAXHEAL-*": "",
    "Last30DPS": "0",
    "dps": "0",
    "MAXHEAL": "",
    "ENCHPS-*": "0.00",
    "Last180DPS": "0",
    "MAXHIT-*": "0",
    "maxhit": "",
    "powerdrain-*": "0",
    "DPS": "0",
    "ParryPct": "0%",
    "hits": "0",
    "hitfailed": "0"
})

nw.Window.get().setAlwaysOnTop(true)

const wss = new WS.Server({
    port: 10505
});

const broadcastList = new Set();

const broadcast = (msg) => {
    for(const ws of broadcastList) {
        ws.send(JSON.stringify(msg))
    }
}

const fixCombatLog = (log) => ({
    ...log,
    msg: {
        ...log.msg,
        Combatant: {
            ...log.msg.Combatant,
            ...Object.keys(log.msg.Combatant).reduce((missingOwners, combatant, index, list) => {
                if (!combatant.includes('(')) return missingOwners;

                const owner = combatant.split('(').slice(0, -1);
                if (list.find((name) => name === owner)) {
                    return {
                        ...missingOwners,
                        [owner]: createEmptyLog(owner)
                    }
                }

                return missingOwners;
            }, {})
        }
    }
})

wss.on('connection', (ws) => {
    console.log('client connected')
    ws.on('message', (rawData) => {
        let msg;
        try {
            msg = JSON.parse(rawData)
            if (msg && msg.type === 'set_id') {
                console.log('subscribed')
                broadcastList.add(ws)
            }
            if (msg && msg.msgtype === 'CombatData') {
                const fixedMsg = fixCombatLog(msg)
                console.log('Received', msg)
                console.log('Corrected', fixedMsg)
                broadcast(fixedMsg);
            }
        } catch {

        }
    }, {once: false})
})

addEventListener('unload', () => wss.close())