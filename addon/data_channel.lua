local ws_connected = false
local sent_dc_msg = false
local connection_attempts = 0

local retry_limit = 1

function send_data(data)
    local ok = client:send(data)
    ws_connected = ok

    if not ok and not sent_dc_msg then
        message('Could not find Eoparse server. Did you start the UI?')
        sent_dc_msg = true
    end
end

function connect_channel()
    if client then
        client:close()
    end
    client = websocket.client.sync({timeout=1})
    local ok = client:connect('ws://127.0.0.1:10505')
    ws_connected = ok
    sent_dc_msg = false

    if not ok and not sent_dc_msg then
        message('Could not find Eoparse server. Did you start the UI?')
        sent_dc_msg = true
    else
        connection_attempts = 0
    end
end

function reset_retries()
    connection_attempts = 0
end

function maintain_connection()
    if connection_attempts < retry_limit and (not client or not ws_connected) then
        connection_attempts = connection_attempts + 1
        connect_channel()

        if connection_attempts >= retry_limit then
            coroutine.schedule(reset_retries, 30)
        end
    end
end

function create_combat_message(filters)
    local msg = {}
    local data = {}
    
    msg.type = 'broadcast'
    msg.msgtype = 'CombatData'

    data.Combatant = {}
    data.isActive = dps_clock:is_active()
    
    local total_damage = 0
    local total_dps = 0
    local all_largest = nil
    local all_largest_player = ''
    local total_miss = 0
    local total_hits = 0
    local total_crits = 0
    local encounter_name = (filters and filters~= '') and 'Encounter ('..filters..')' or 'Encounter'
    local main_player = windower.ffxi.get_player()
    local you = main_player.name
    local main_model = model:findOrCreateTempPlayer(you)
    main_model.job = main_player.main_job

    for __, player_name in pairs(get_players()) do
        if type(player_name) == 'string' then
            local damage = get_player_damage(player_name)
            local dps = dps_clock:is_active() and (damage / (dps_clock.clock or 1)) or 0
            local job = model:findOrCreateTempPlayer(player_name).job
            local parry = get_player_stat_tally('parry', player_name) 
            local crits = get_player_stat_tally('crit', player_name) + get_player_stat_tally('r_crit', player_name)
            local hits = crits + get_player_stat_tally('melee', player_name) + get_player_stat_tally('ranged', player_name) + get_player_stat_tally('ws', player_name)
            local miss = get_player_stat_tally('miss', player_name) + get_player_stat_tally('r_miss', player_name) + get_player_stat_tally('ws_miss', player_name)
            local largest = get_player_stat_largest('largest', player_name)
            local name = player_name == you and 'YOU' or player_name

            total_damage = total_damage + damage
            total_dps = total_dps + dps
            total_miss = total_miss + miss
            total_hits = total_hits + hits
            total_crits = total_crits + crits


            if largest then
                if not all_largest or all_largest.damage < largest.damage then
                    all_largest = largest
                    all_largest_player = player_name
                end
            end

            data.Combatant[''..name] = create_combatant(
                ''..name,
                job == '???' and 'BSM' or job,
                dps_clock.clock,
                dps_clock:to_string(),
                dps,
                damage,
                hits,
                crits,
                miss,
                largest and string.format('%s-%i', largest.name, largest.damage) or '',
                largest and ''..largest.damage or '0',
                parry,
                0
            )
        end
    end

    data.Encounter = create_encounter(
        encounter_name,
        dps_clock.clock,
        dps_clock:to_string(),
        total_dps,
        total_damage,
        total_hits,
        total_crits,
        total_miss,
        all_largest and string.format('%s-%s-%i', all_largest_player, all_largest.name, all_largest.damage) or '',
        all_largest and ''..all_largest.damage or '0',
        0
    )

    msg.msg = data
    
    return msg
end

function create_combatant(name, job, duration, time, dps, total_damage, hits, crits, misses, largest_hit, largest_hit_dmg, parry, heal_total)
    duration = duration or 1

    local hps = 0

    return {
        ["Job"] = job,
        ["n"] = "\n",
        ["t"] = "\t",
        ["name"] = ''..name,
        ["duration"] = time,
        ["DURATION"] = ''..duration,
        ["damage"] = ''..total_damage,
        ["damage-m"] = ''..(total_damage / 1000000),
        ["damage-*"] = string.format('%.2fK', total_damage / 1000),
        ["DAMAGE-k"] = string.format('%.f', total_damage / 1000),
        ["DAMAGE-m"] = string.format('%.f', total_damage / 1000000),
        ["DAMAGE-b"] = string.format('%.f', total_damage / 1000000000),
        ["DAMAGE-*"] = string.format('%.fK', total_damage / 1000),
        ["dps"] = string.format('%.2f', dps),
        ["dps-*"] = "dps-*",
        ["DPS"] = string.format('%.f', dps),
        ["DPS-k"] = string.format('%.f', dps / 1000),
        ["DPS-m"] = "DPS-m",
        ["DPS-*"] = string.format('%.f', dps / 1000),
        ["encdps"] = string.format('%.2f', dps),
        ["encdps-*"] = string.format('%.2fL', dps / 1000),
        ["ENCDPS"] = string.format('%.f', dps),
        ["ENCDPS-k"] = string.format('%.f', dps / 1000),
        ["ENCDPS-m"] = string.format('%.f', dps / 1000000),
        ["ENCDPS-*"] = string.format('%.f', dps),
        ["hits"] = ''..hits,
        ["crithits"] = ''..crits,
        ["crithit%"] = string.format('%2.f', 100 * crits / math.max(1,hits)).."%",
        ["misses"] = ''..misses,
        ["hitfailed"] = ''..misses,
        ["swings"] = ''..(hits + misses),
        ["tohit"] = string.format('%2.2f', 100 * (hits / math.floor(1, hits + misses))),
        ["TOHIT"] = string.format('%2.f', 100 * (hits / math.floor(1, hits + misses))),
        ["maxhit"] = largest_hit,
        ["MAXHIT"] = largest_hit_dmg,
        ["maxhit-*"] = largest_hit,
        ["MAXHIT-*"] = largest_hit_dmg,
        ["healed"] = ''..heal_total,
        ["enchps"] = string.format('%.2f', hps),
        ["enchps-*"] = string.format('%.f', hps),
        ["ENCHPS"] = string.format('%.f', hps),
        ["ENCHPS-k"] = string.format('%.f', hps / 1000),
        ["ENCHPS-m"] = string.format('%.2f', hps / 1000000),
        ["ENCHPS-*"] = string.format('%.2f', hps / 1000),
        ["heals"] = "0",
        ["critheals"] = "0",
        ["critheal%"] = "---",
        ["cures"] = "0",
        ["maxheal"] = "",
        ["MAXHEAL"] = "",
        ["maxhealward"] = "",
        ["MAXHEALWARD"] = "",
        ["maxheal-*"] = "",
        ["MAXHEAL-*"] = "",
        ["maxhealward-*"] = "",
        ["MAXHEALWARD-*"] = "",
        ["damagetaken"] = "0",
        ["damagetaken-*"] = "0",
        ["healstaken"] = "0",
        ["healstaken-*"] = "0",
        ["powerdrain"] = "0",
        ["powerdrain-*"] = "0",
        ["powerheal"] = "0",
        ["powerheal-*"] = "0",
        ["kills"] = "0",
        ["deaths"] = "0",
        ["CurrentZoneName"] = "",
        ["Last10DPS"] = ''..dps,
        ["Last30DPS"] = ''..dps,
        ["Last60DPS"] = ''..dps,
        ["Last180DPS"] = ''..dps,
        ["overHeal"] = "0",
        
        ["ParryPct"] = string.format('%.2f', hits and (100 * parry / hits) or 0) .. '%',
        ["DirectHitPct"] = "",
        ["DirectHitCount"] = "",
        ["CritDirectHitCount"] = "",
        ["CritDirectHitPct"] = ""
    }
end

function create_encounter(title, duration, time, dps, total_damage, hits, crits, misses, largest_hit, largest_hit_dmg, heal_total)
    duration = duration or 1

    local hps = 0

    return {
        ["n"] = "\n",
        ["t"] = "\t",
        ["title"] = title,
        ["duration"] = time,
        ["DURATION"] = ''..duration,
        ["damage"] = ''..total_damage,
        ["damage-m"] = ''..(total_damage / 1000000),
        ["damage-*"] = string.format('%.2fK', total_damage / 1000),
        ["DAMAGE-k"] = string.format('%.f', total_damage / 1000),
        ["DAMAGE-m"] = string.format('%.f', total_damage / 1000000),
        ["DAMAGE-b"] = string.format('%.f', total_damage / 1000000000),
        ["DAMAGE-*"] = string.format('%.fK', total_damage / 1000),
        ["dps"] = string.format('%.2f', dps),
        ["dps-*"] = "dps-*",
        ["DPS"] = string.format('%.f', dps),
        ["DPS-k"] = string.format('%.f', dps / 1000),
        ["DPS-m"] = "DPS-m",
        ["DPS-*"] = string.format('%.f', dps / 1000),
        ["encdps"] = string.format('%.2f', dps),
        ["encdps-*"] = string.format('%.2fL', dps / 1000),
        ["ENCDPS"] = string.format('%.f', dps),
        ["ENCDPS-k"] = string.format('%.f', dps / 1000),
        ["ENCDPS-m"] = string.format('%.f', dps / 1000000),
        ["ENCDPS-*"] = string.format('%.f', dps),
        ["hits"] = ''..hits,
        ["crithits"] = ''..crits,
        ["crithit%"] = string.format('%2.f', 100 * crits / math.max(1,hits)).."%",
        ["misses"] = ''..misses,
        ["hitfailed"] = ''..misses,
        ["swings"] = ''..(hits + misses),
        ["tohit"] = string.format('%2.2f', 100 * (hits / math.floor(1, hits + misses))),
        ["TOHIT"] = string.format('%2.f', 100 * (hits / math.floor(1, hits + misses))),
        ["maxhit"] = largest_hit,
        ["MAXHIT"] = largest_hit_dmg,
        ["maxhit-*"] = largest_hit,
        ["MAXHIT-*"] = largest_hit_dmg,
        ["healed"] = ''..heal_total,
        ["enchps"] = string.format('%.2f', hps),
        ["enchps-*"] = string.format('%.f', hps),
        ["ENCHPS"] = string.format('%.f', hps),
        ["ENCHPS-k"] = string.format('%.f', hps / 1000),
        ["ENCHPS-m"] = string.format('%.2f', hps / 1000000),
        ["ENCHPS-*"] = string.format('%.2f', hps / 1000),
        ["heals"] = "0",
        ["critheals"] = "0",
        ["critheal%"] = "---",
        ["cures"] = "0",
        ["maxheal"] = "",
        ["MAXHEAL"] = "",
        ["maxhealward"] = "",
        ["MAXHEALWARD"] = "",
        ["maxheal-*"] = "",
        ["MAXHEAL-*"] = "",
        ["maxhealward-*"] = "",
        ["MAXHEALWARD-*"] = "",
        ["damagetaken"] = "0",
        ["damagetaken-*"] = "0",
        ["healstaken"] = "0",
        ["healstaken-*"] = "0",
        ["powerdrain"] = "0",
        ["powerdrain-*"] = "0",
        ["powerheal"] = "0",
        ["powerheal-*"] = "0",
        ["kills"] = "0",
        ["deaths"] = "0",
        ["CurrentZoneName"] = "",
        ["Last10DPS"] = ''..dps,
        ["Last30DPS"] = ''..dps,
        ["Last60DPS"] = ''..dps,
        ["Last180DPS"] = ''..dps,
        ["overHeal"] = "0"
    }
end