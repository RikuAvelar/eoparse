packets = require('packets')

local zoning = false
local model = {}
local isInitialized = false

model.players = T{}

function model:clear()
    self.players:clear()
end

function model:findPlayer(name, id)
	local foundPlayer

	-- look in players list
	for p in self.players:it() do
		if (name ~= nil and p.name == name) or (id ~= nil and p.id == id) then
			foundPlayer = p
			break
		end
	end
	return foundPlayer
end

-- finds player by name OR id, create new if not found and add to temp list
function model:findOrCreateTempPlayer(name, id)
	local foundPlayer = self:findPlayer(name, id)
	
	if not foundPlayer then
		local displayName = name
		if not displayName then displayName = '???' end
		-- utils:log('Creating temp player for '..displayName..' with ID '..tostring(id))
		
		foundPlayer = {}
		foundPlayer.name = name
		foundPlayer.id = id
		foundPlayer.job = '???'
		foundPlayer.jobLvl = '???'
		foundPlayer.subJob = '???'
		foundPlayer.subJobLvl = '???'
		self.players:append(foundPlayer)
	end
	
	return foundPlayer
end

function model:findPlayerByMember(member)
	for player in self.players:it() do
		if (player.name == nil and member.mob ~= nil and player.id == member.mob.id) then
			-- utils:log('Found player based on ID '..member.mob.id..' in temp players list.')
			return player
		end
	
		if player.name == member.name then
			-- utils:log('Found player '..member.name..' in player players list.')
			return player
		end
	end
	
	return nil
end

function updatePlayerJobFromPacket(player, packet)
	-- these can contain NON 0 / NON 0 when the party member is out of zone
	-- seem to always get NON 0 / NON 0 if character has no SJ
	local mJob = packet['Main job']
	local mJobLvl = packet['Main job level']
	local sJob =  packet['Sub job']
	local sJobLvl = packet['Sub job level']
	local playerId = packet['ID']
	
	if (mJob and mJobLvl and sJob and sJobLvl and mJobLvl > 0) then
		player.id = playerId
		player.job = res.jobs[mJob].name_short
		player.jobLvl = mJobLvl
		player.subJob = res.jobs[sJob].name_short
		player.subJobLvl = sJobLvl
		
		-- print('found player '..(player.name or player.id))
		-- utils:log('Set job info: '..res.jobs[mJob].name_short..tostring(mJobLvl)..'/'..res.jobs[sJob].name_short..tostring(sJobLvl), 0)
	else
		-- utils:log('Unusable job info. Dropping.', 0)
	end
end


function zoningFinished()
	zoning = false
	update_texts()
end

windower.register_event('incoming chunk',function(id,original,modified,injected,blocked)
	if not zoning then
		if id == 0xDF then -- char update
			packet = packets.parse('incoming', original)
			if packet then
				local playerId = packet['ID']
				-- print(packet['Name'])
				-- utils:log('PACKET: Char update for player ID: '..playerId, 0)
			
				local foundPlayer = model:findOrCreateTempPlayer(nil, playerId)
				updatePlayerJobFromPacket(foundPlayer, packet)
			end
		end
		if id == 0xDD then -- party member update
			packet = packets.parse('incoming', original)
			if packet then
				local name = packet['Name']
				local playerId = packet['ID']
				if name then
					-- utils:log('PACKET: Party member update for '..name, 0)
					
					local foundPlayer = model:findOrCreateTempPlayer(name, playerId)
					updatePlayerJobFromPacket(foundPlayer, packet)
				else
					-- utils:log('Name data not found.', 3)
				end
			else
				-- utils:log('Failed to parse packet.', 3)
			end
		end
	end
	
	if id == 0xB then
		-- utils:log('Zoning...')
		zoning = true
		
		update_texts()
		dps_clock:reset()
		connect_channel()
		check_auto_export()
		reset_parse()
		
        model:clear()
    elseif id == 0xA and zoning then
		-- utils:log('Zoning done.')
		coroutine.schedule(zoningFinished, 3) -- delay a bit so init does not see pre-zone party lists
    end
end)

function updatePlayers()
	local mainPlayer = windower.ffxi.get_player()
	local party = T(windower.ffxi.get_party())
	local zone = windower.ffxi.get_info().zone
	local target = windower.ffxi.get_mob_by_target('t')
	local subtarget = windower.ffxi.get_mob_by_target('st')
	
	for i = 0, 25 do
		local prefix = i < 6 and 'p' or 'a'
		local key = '%s%i':format(prefix, i % 26)
		local member = party[key]
		
		if member then
			local player = model:findPlayerByMember(member)

			if not player then
				-- print('player not found '.. member.name)
				player = model:findOrCreateTempPlayer(member.name, member.mob and member.mob.id)
			end
			
			player.name = member.name
		
			if (member.zone ~= zone) then -- outside zone
				-- player:clear()
			else
				if member.mob then
					player.id = member.mob.id
				end
				
				if (member.name == mainPlayer.name) then -- set buffs and job info for main player
					player.job = res.jobs[mainPlayer.main_job_id].name_short
					player.jobLvl = mainPlayer.main_job_level
					
					if (mainPlayer.sub_job_id) then -- only if subjob is set
						player.subJob = res.jobs[mainPlayer.sub_job_id].name_short
						player.subJobLvl = mainPlayer.sub_job_level
					end
				end
			end
		end
	end
end

windower.register_event('prerender', function()
	if zoning then return end

	if windower.ffxi.get_info().logged_in and not isInitialized then
		isInitialized = true
	end

	if not isInitialized then return end
	
	updatePlayers()
end)

return model