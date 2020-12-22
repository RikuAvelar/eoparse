const WS = require('ws')

// const data = {
//     "type": "broadcast",
//     "msgtype": "CombatData",
//     "msg": {
//         "Encounter": {
//             "n": "\n",
//             "t": "\t",
//             "title": "Encounter",
//             "duration": "06:34",
//             "DURATION": "394",
//             "damage": "671448",
//             "damage-m": "0.67",
//             "damage-*": "671.45K",
//             "DAMAGE-k": "671",
//             "DAMAGE-m": "1",
//             "DAMAGE-b": "0",
//             "DAMAGE-*": "671K",
//             "dps": "1704.18",
//             "dps-*": "dps-*",
//             "DPS": "1704",
//             "DPS-k": "2",
//             "DPS-m": "DPS-m",
//             "DPS-*": "1704",
//             "encdps": "1704.18",
//             "encdps-*": "1.70K",
//             "ENCDPS": "1704",
//             "ENCDPS-k": "2",
//             "ENCDPS-m": "0",
//             "ENCDPS-*": "1704",
//             "hits": "124",
//             "crithits": "24",
//             "crithit%": "0%",
//             "misses": "0",
//             "hitfailed": "0",
//             "swings": "124",
//             "tohit": "100.00",
//             "TOHIT": "100",
//             "maxhit": "YOU-Ruin II-18477",
//             "MAXHIT": "YOU-18477",
//             "maxhit-*": "YOU-Ruin II-18.48K",
//             "MAXHIT-*": "YOU-18K",
//             "healed": "0",
//             "enchps": "0.00",
//             "enchps-*": "0",
//             "ENCHPS": "0",
//             "ENCHPS-k": "0",
//             "ENCHPS-m": "0",
//             "ENCHPS-*": "0",
//             "heals": "0",
//             "critheals": "24",
//             "critheal%": "---",
//             "cures": "0",
//             "maxheal": "",
//             "MAXHEAL": "",
//             "maxhealward": "",
//             "MAXHEALWARD": "",
//             "maxheal-*": "",
//             "MAXHEAL-*": "",
//             "maxhealward-*": "",
//             "MAXHEALWARD-*": "",
//             "damagetaken": "0",
//             "damagetaken-*": "0",
//             "healstaken": "0",
//             "healstaken-*": "0",
//             "powerdrain": "0",
//             "powerdrain-*": "0",
//             "powerheal": "0",
//             "powerheal-*": "0",
//             "kills": "0",
//             "deaths": "0",
//             "CurrentZoneName": "Shirogane",
//             "Last10DPS": "1834",
//             "Last30DPS": "1695",
//             "Last60DPS": "1652",
//             "Last180DPS": "1630.35",
//             "overHeal": "0"
//         },
//         "Combatant": {
//             "YOU": {
//                 "n": "\n",
//                 "t": "\t",
//                 "name": "YOU",
//                 "duration": "00:02",
//                 "DURATION": "2",
//                 "damage": "34415",
//                 "damage-m": "0.03",
//                 "damage-b": "0.00",
//                 "damage-*": "34.42K",
//                 "DAMAGE-k": "34",
//                 "DAMAGE-m": "0",
//                 "DAMAGE-b": "0",
//                 "DAMAGE-*": "34K",
//                 "damage%": "5%",
//                 "dps": "17207.50",
//                 "dps-*": "17.21K",
//                 "DPS": "17208",
//                 "DPS-k": "17",
//                 "DPS-m": "0",
//                 "DPS-*": "17K",
//                 "encdps": "87.35",
//                 "encdps-*": "87",
//                 "ENCDPS": "87",
//                 "ENCDPS-k": "0",
//                 "ENCDPS-m": "0",
//                 "ENCDPS-*": "87",
//                 "hits": "2",
//                 "crithits": "2",
//                 "crithit%": "100%",
//                 "crittypes": "0.0%L - 0.0%F - 0.0%M",
//                 "misses": "0",
//                 "hitfailed": "0",
//                 "swings": "2",
//                 "tohit": "100.00",
//                 "TOHIT": "100",
//                 "maxhit": "Ruin II-18477",
//                 "MAXHIT": "18477",
//                 "maxhit-*": "Ruin II-18.48K",
//                 "MAXHIT-*": "18K",
//                 "healed": "0",
//                 "healed%": "--",
//                 "enchps": "0.00",
//                 "enchps-*": "0",
//                 "ENCHPS": "0",
//                 "ENCHPS-k": "0",
//                 "ENCHPS-m": "0",
//                 "ENCHPS-*": "0",
//                 "critheals": "0",
//                 "critheal%": "0%",
//                 "heals": "0",
//                 "cures": "0",
//                 "maxheal": "",
//                 "MAXHEAL": "",
//                 "maxhealward": "",
//                 "MAXHEALWARD": "",
//                 "maxheal-*": "",
//                 "MAXHEAL-*": "",
//                 "maxhealward-*": "",
//                 "MAXHEALWARD-*": "",
//                 "damagetaken": "0",
//                 "damagetaken-*": "0",
//                 "healstaken": "0",
//                 "healstaken-*": "0",
//                 "powerdrain": "0",
//                 "powerdrain-*": "0",
//                 "powerheal": "0",
//                 "powerheal-*": "0",
//                 "kills": "0",
//                 "deaths": "0",
//                 "threatstr": "+(0)0/-(0)0",
//                 "threatdelta": "0",
//                 "Last10DPS": "0",
//                 "Last30DPS": "0",
//                 "Last60DPS": "0",
//                 "Job": "Smn",
//                 "ParryPct": "0%",
//                 "BlockPct": "0%",
//                 "IncToHit": "---",
//                 "OverHealPct": "0%",
//                 "DirectHitPct": "50%",
//                 "DirectHitCount": "1",
//                 "CritDirectHitCount": "1",
//                 "CritDirectHitPct": "50%",
//                 "overHeal": "0",
//                 "damageShield": "0",
//                 "absorbHeal": "0",
//                 "Last180DPS": "0.00"
//             },
//             "Ruby Carbuncle (Rhemia Rhohizon)": {
//                 "n": "\n",
//                 "t": "\t",
//                 "name": "Ruby Carbuncle (Rhemia Rhohizon)",
//                 "duration": "06:33",
//                 "DURATION": "393",
//                 "damage": "637033",
//                 "damage-m": "0.64",
//                 "damage-b": "0.00",
//                 "damage-*": "637.03K",
//                 "DAMAGE-k": "637",
//                 "DAMAGE-m": "1",
//                 "DAMAGE-b": "0",
//                 "DAMAGE-*": "637K",
//                 "damage%": "94%",
//                 "dps": "1620.95",
//                 "dps-*": "1.62K",
//                 "DPS": "1621",
//                 "DPS-k": "2",
//                 "DPS-m": "0",
//                 "DPS-*": "1620",
//                 "encdps": "1616.84",
//                 "encdps-*": "1.62K",
//                 "ENCDPS": "1617",
//                 "ENCDPS-k": "2",
//                 "ENCDPS-m": "0",
//                 "ENCDPS-*": "1616",
//                 "hits": "122",
//                 "crithits": "22",
//                 "crithit%": "18%",
//                 "crittypes": "0.0%L - 0.0%F - 0.0%M",
//                 "misses": "0",
//                 "hitfailed": "0",
//                 "swings": "122",
//                 "tohit": "100.00",
//                 "TOHIT": "100",
//                 "maxhit": "Burning Strike-8423",
//                 "MAXHIT": "8423",
//                 "maxhit-*": "Burning Strike-8.42K",
//                 "MAXHIT-*": "8423",
//                 "healed": "0",
//                 "healed%": "--",
//                 "enchps": "0.00",
//                 "enchps-*": "0",
//                 "ENCHPS": "0",
//                 "ENCHPS-k": "0",
//                 "ENCHPS-m": "0",
//                 "ENCHPS-*": "0",
//                 "critheals": "0",
//                 "critheal%": "0%",
//                 "heals": "0",
//                 "cures": "0",
//                 "maxheal": "",
//                 "MAXHEAL": "",
//                 "maxhealward": "",
//                 "MAXHEALWARD": "",
//                 "maxheal-*": "",
//                 "MAXHEAL-*": "",
//                 "maxhealward-*": "",
//                 "MAXHEALWARD-*": "",
//                 "damagetaken": "0",
//                 "damagetaken-*": "0",
//                 "healstaken": "0",
//                 "healstaken-*": "0",
//                 "powerdrain": "0",
//                 "powerdrain-*": "0",
//                 "powerheal": "0",
//                 "powerheal-*": "0",
//                 "kills": "0",
//                 "deaths": "0",
//                 "threatstr": "+(0)0/-(0)0",
//                 "threatdelta": "0",
//                 "Last10DPS": "1834",
//                 "Last30DPS": "1695",
//                 "Last60DPS": "1652",
//                 "Job": "",
//                 "ParryPct": "0%",
//                 "BlockPct": "0%",
//                 "IncToHit": "---",
//                 "OverHealPct": "0%",
//                 "DirectHitPct": "45%",
//                 "DirectHitCount": "55",
//                 "CritDirectHitCount": "10",
//                 "CritDirectHitPct": "8%",
//                 "overHeal": "0",
//                 "damageShield": "0",
//                 "absorbHeal": "0",
//                 "Last180DPS": "1630.35"
//             }
//         },
//         "isActive": true
//     }
// }


// nw.Window.open('index.html?HOST_PORT=ws://127.0.0.1:10505/', {}, function(win) {});

// const server = http.createServer((req, res) => {
//     res.writeHead(404);
//     res.end();
// });

// server.listen(10505);


// if (typeof nw !== 'undefined') {
nw.Window.get().setAlwaysOnTop(true)
// } else {
const wss = new WS.Server({
    port: 10505
});

const broadcastList = new Set();

const broadcast = (msg) => {
    for(const ws of broadcastList) {
        ws.send(JSON.stringify(msg))
    }
}

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
                console.log(msg)
                broadcast(msg);
            }
        } catch {

        }
        // console.log(data);
    }, {once: false})
})

addEventListener('unload', () => wss.close())