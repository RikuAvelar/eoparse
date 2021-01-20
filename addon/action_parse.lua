--[[ TO DO

	-- Test spike damage
	-- Weird SC bug (also occurs in SB) 289

]]

local skillchains = {
	[288] = 'Light',
	[289] = 'Darkness',
	[290] = 'Gravitation',
	[291] = 'Fragmentation',
	[292] = 'Distortion',
	[293] = 'Fusion',
	[294] = 'Compression',
	[295] = 'Liquefaction',
	[296] = 'Induration',
	[297] = 'Reverberation',
	[298] = 'Transfixion',
	[299] = 'Scission',
	[300] = 'Detonation',
	[301] = 'Impaction',
	[767] = 'Radiance',
	[768] = 'Umbra'
}

function parse_action_packet(act)
	if pause then return end
	
	local actionpacket = ActionPacket.new(act)	
	local player = windower.ffxi.get_player()
	local NPC_name, PC_name
   
	act.actor = player_info(act.actor_id)
	if not act.actor then
		return
	end
	
	for i,targ in pairs(act.targets) do
        for n,m in pairs(targ.actions) do
            if m.message ~= 0 and res.action_messages[m.message] ~= nil then	
				target = player_info(targ.id)
				-- if mob is actor, record defensive data
				if act.actor.type == 'mob' and settings.record[target.type] then
					NPC_name = nickname(act.actor.name:gsub(" ","_"))
					PC_name = construct_PC_name(target)
					if target.name == player.name and settings.index_shield and get_shield() then
						PC_name = PC_name:sub(1, 6)..'-'..get_shield():sub(1, 3)..''
					end
					if settings.index_reprisal and buffs.Reprisal then PC_name = PC_name .. 'R' end
					if settings.index_palisade and buffs.Palisade then PC_name = PC_name .. 'P' end
					if not database[NPC_name] or not database[NPC_name][PC_name] then						
						init_mob_player_table(NPC_name,PC_name)
					end
					mob_player_table = database[NPC_name][PC_name]
					
					if m.reaction == 12 and act.category == 1 then  --block
						register_data(mob_player_table,'block',m.param)
					elseif m.reaction == 11 and act.category == 1 then  --parry
						register_data(mob_player_table,'parry')
					elseif m.message == 1 then --hit
						register_data(mob_player_table,'hit',m.param)
					elseif m.message == 67 then --crit
						register_data(mob_player_table,'hit',m.param)
					elseif m.message == 106 then  --intimidate
						register_data(mob_player_table,'intimidate')
					elseif m.message == 15 or m.message == 282 then --evade
						register_data(mob_player_table,'evade')
					end

					if m.message == 373 then  --absorb (can happen during block)
						register_data(mob_player_table,'absorb',m.param)
					end					
					
					if m.has_spike_effect then
						register_data(mob_player_table,'spike',m.spike_effect_param)
					end

				-- if player is actor, record offensive data
				elseif target.type == 'mob' and settings.record[act.actor.type] then
					NPC_name = nickname(target.name:gsub(" ","_"))
					PC_name = construct_PC_name(act.actor)
					if not database[NPC_name] or not database[NPC_name][PC_name] then						
						init_mob_player_table(NPC_name,PC_name)
					end
					mob_player_table = database[NPC_name][PC_name]

					if m.message == 1 then --melee
						register_data(mob_player_table,'melee',m.param)
					elseif m.message == 67 then --crit
						register_data(mob_player_table,'crit',m.param)
					elseif m.message == 15 or m.message == 63 then --miss
						register_data(mob_player_table,'miss')
					elseif T{352, 576, 577}:contains(m.message) then --ranged
						register_data(mob_player_table,'ranged',m.param)
					elseif m.message == 353 then --ranged crit
						register_data(mob_player_table,'r_crit',m.param)
					elseif m.message == 354 then --ranged miss
						register_data(mob_player_table,'r_miss')
					elseif m.message == 185 or m.message == 197 then --WS hit
						register_data(mob_player_table,'ws',m.param,'ws',act.param)
					elseif m.message == 264 then --AoE WS hit
						register_data(mob_player_table,'ws',m.param,'ws',act.param)
					elseif m.message == 187 then --WS drain
						register_data(mob_player_table,'ws',m.param,'ws',act.param)
					elseif m.message == 188 then --WS miss
						register_data(mob_player_table,'ws_miss',nil,'ws',act.param)
					elseif m.message == 2 or m.message == 227 or m.message == 252 or m.message == 265 or m.message == 379 then --spell
						register_data(mob_player_table,'spell',m.param,'spell',act.param)
					elseif m.message == 110 or m.message == 317 or m.message == 522 then --JA
						register_data(mob_player_table,'ja',m.param,'ja',act.param)
					elseif m.message == 158 or m.message == 324 then --JA miss
						register_data(mob_player_table,'ja_miss',m.param,'ja',act.param)
					elseif m.message == 157 then --Barrage
						register_data(mob_player_table,'ja',m.param,'ja','Barrage')
					elseif m.message == 77 then --Sange
						register_data(mob_player_table,'ja',m.param,'ja','Sange')
					end

					if m.has_add_effect then
						if T{196,223,288,289,290,291,292,293,294,295,296,297,298,299,300,301,302,385,386,387,388,389,390,391,392,393,394,395,396,397,398,732,767,768}:contains(m.add_effect_message) then
							if string.match(PC_name, '.+ \((.+)\)') then
								local player, full_match = string.match(PC_name, '.+ \((.+)\)')
								PC_name = string.sub(player, 2, -2)
							end
							if not database[NPC_name]["SC ("..PC_name..")"] then
								init_mob_player_table(NPC_name,"SC ("..PC_name..")")
							end	
							mob_player_table = database[NPC_name]["SC ("..PC_name..")"]
							register_data(mob_player_table,'sc',m.add_effect_param,nil,m.add_effect_message)
							debug('sc ('..PC_name..') '..m.add_effect_message..' '..m.add_effect_param)
						elseif T{161,163,229}:contains(m.add_effect_message) and m.add_effect_param > 0 then
							register_data(mob_player_table,'add',m.add_effect_param)
						end
					end
				end				
			end
		end
	end


	if PC_name and update_tracker == update_interval then
		update_texts()		
	end
	update_tracker = (update_tracker % update_interval) + 1
end

function construct_PC_name(PC)
	local name = PC.name
    local result = ''
    if PC.owner then
		result = name
        result = result..' ('..nickname(PC.owner.name)..')'
    else
        return nickname(name)
    end
    return result
end

function nickname(player_name)
	if renames[player_name] then
		return renames[player_name]
	else
		return player_name
	end
end

function init_mob_player_table(mob_name,player_name)
	if not database[mob_name] then
		database[mob_name] = {}
	end
	if string.match(player_name, '.+ \((.+)\)') then
		local player, full_match = string.match(player_name, '.+ \((.+)\)')
		local owner = string.sub(player, 2, -2)

		if not database[mob_name][owner] then
			database[mob_name][owner] = {}
		end
	end
	database[mob_name][player_name] = {}	
end

function register_data(mob_player_table,stat,val,spell_type,spell_id)
	if not mob_player_table[get_stat_type(stat)] then
		mob_player_table[get_stat_type(stat)] = {}
	end
	
	if get_stat_type(stat) == "category" then --handle WS, spells, and JA
		if type(spell_id) == 'number' then
			if spell_type == "ws" and res.weapon_skills[spell_id] then spell_name = res.weapon_skills[spell_id].english
			elseif spell_type == "ja" and res.job_abilities[spell_id] then spell_name = res.job_abilities[spell_id].english
			elseif spell_type == "spell" and res.spells[spell_id] then spell_name = res.spells[spell_id].english 
			else spell_name = "unknown" end
		elseif type(spell_id) == 'string' then spell_name = spell_id end
		
		if not spell_name then
			message('There was an error recording that action...')
			return
		end

		if spell_type == 'ws' or spell_type == 'spell' or spell_type == 'ja' then
			if not mob_player_table[get_stat_type('largest')] then
				mob_player_table[get_stat_type('largest')] = {}
			end
			if not mob_player_table[get_stat_type('largest')]['largest'] then
				mob_player_table[get_stat_type('largest')]['largest'] = {
					['name'] = '',
					['damage'] = 0
				}
			end

			if val and mob_player_table[get_stat_type('largest')].largest.damage < val then
				mob_player_table[get_stat_type('largest')]['largest'].name = spell_name
				mob_player_table[get_stat_type('largest')]['largest'].damage = val
			end
		end
		
		spell_name = spell_name:gsub(" ","_"):gsub("'",""):gsub(":","")
		
		if not mob_player_table[get_stat_type(stat)][stat] then
			mob_player_table[get_stat_type(stat)][stat] = {}
		end
		
		if not mob_player_table[get_stat_type(stat)][stat][spell_name] then
			mob_player_table[get_stat_type(stat)][stat][spell_name] = {}
		end
		
		if not mob_player_table[get_stat_type(stat)][stat][spell_name].tally then
			mob_player_table[get_stat_type(stat)][stat][spell_name].tally = 0 
		end
		
		mob_player_table[get_stat_type(stat)][stat][spell_name].tally = mob_player_table[get_stat_type(stat)][stat][spell_name].tally + 1
		
		if val then
			if not mob_player_table[get_stat_type(stat)][stat][spell_name].damage then
				mob_player_table[get_stat_type(stat)][stat][spell_name].damage = val
			else
				mob_player_table[get_stat_type(stat)][stat][spell_name].damage = mob_player_table[get_stat_type(stat)][stat][spell_name].damage + val
			end
		end
	else --handle everything else
		if not mob_player_table[get_stat_type(stat)][stat] then
			mob_player_table[get_stat_type(stat)][stat] = {}
		end
		
		if not mob_player_table[get_stat_type(stat)][stat].tally then
			mob_player_table[get_stat_type(stat)][stat].tally = 0 
		end
		
		mob_player_table[get_stat_type(stat)][stat].tally = mob_player_table[get_stat_type(stat)][stat].tally + 1
		
		if val then
			if not mob_player_table[get_stat_type(stat)][stat].damage then
				mob_player_table[get_stat_type(stat)][stat].damage = val
			else
				mob_player_table[get_stat_type(stat)][stat].damage = mob_player_table[get_stat_type(stat)][stat].damage + val
			end

			if stat == 'sc' then
				if not mob_player_table[get_stat_type('largest')] then
					mob_player_table[get_stat_type('largest')] = {}
				end
				if not mob_player_table[get_stat_type('largest')]['largest'] then
					mob_player_table[get_stat_type('largest')]['largest'] = {
						['name'] = '',
						['damage'] = 0
					}
				end
	
				if val and mob_player_table[get_stat_type('largest')].largest.damage < val then
					local name = skillchains[spell_id] or 'Skillchain ('..spell_id..')'
					mob_player_table[get_stat_type('largest')]['largest'].name = name
					mob_player_table[get_stat_type('largest')]['largest'].damage = val
				end
			end
		end
	end

end

function get_shield()
	local current_equip = windower.ffxi.get_items().equipment
	local shield_id, shield_bag = 0,0
	for i,v in pairs(current_equip) do
		if i == 'sub' then
			shield_id = v
		elseif i=='sub_bag' then
			shield_bag = v
		end
	end
	
	if shield_id==0 then
		return nil
	end
	
	-- res.items[shield]
	shield = windower.ffxi.get_items(shield_bag,shield_id)
	return res.items[shield.id].english
end

function player_info(id)
    local player_table = windower.ffxi.get_mob_by_id(id)
    local typ,owner
    
    if player_table == nil then
        return {name=nil,id=nil,type='debug',owner=nil}
    end
    
    for i,v in pairs(windower.ffxi.get_party()) do
        if type(v) == 'table' and v.mob and v.mob.id == player_table.id then           
            if i == 'p0' then
                typ = 'party'
            elseif i:sub(1,1) == 'p' then
                typ = 'party'
            else
				typ = 'alliance'
            end
        end
    end
    
    if not typ then
        if player_table.is_npc then
            if player_table.id%4096>2047 then
                for i,v in pairs(windower.ffxi.get_party()) do
                    if type(v) == 'table' and v.mob and v.mob.pet_index and v.mob.pet_index == player_table.index then
                        typ = 'pet'
						owner = v
                    elseif type(v) == 'table' and v.mob and v.mob.fellow_index and v.mob.fellow_index == player_table.index then
                        typ = 'fellow'
                        owner = v
                        break
                    end
                end
            else
                typ = 'mob'
            end
        else
            typ = 'other'
        end
    end
    if not typ then typ = 'debug' end
    return {name=player_table.name,id=id,type=typ,owner=(owner or nil)}
end