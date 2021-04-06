_addon.version = '1.3.2'
_addon.name = 'eoParse'
_addon.author = 'Rhemia'
_addon.commands = {'eoparse','eop'}

require 'tables'
require 'sets'
require 'strings'
require 'actions'
json = require 'json'
websocket = require 'websocket'
config = require('config')
texts = require('texts')
res = require 'resources'

websocket = require'websocket'
client = websocket.client.sync({timeout=2})

messageColor = 213

default_settings = {}
default_settings.UpdateFrequency = 0.5
default_settings.update_interval = 3
default_settings.split_encounters = true
default_settings.debug = false
default_settings.index_shield = false
default_settings.index_reprisal = true
default_settings.index_palisade = true
default_settings.record = {
		["party"] = true,
		["alliance"] = true,
		["pet"] = true,
		["fellow"] = true
	}
default_settings.label = {
		["player"] = {red=100,green=200,blue=200},
		["stat"] = {red=225,green=150,blue=0},
	}
default_settings.display = {}
default_settings.display.melee = {
		["visible"] = true,
		["type"] = "offense",
		["pos"] = {x=570,y=50},
		["order"] = L{"damage","melee","ws"},
		["max"] = 6,
		["data_types"] = {
			["damage"] = S{'total','total-percent'},
			["melee"] = S{'percent'},
			["miss"] = S{'tally'},
			["crit"] = S{'percent'},
			["ws"] = S{'avg'},
			["ja"] = S{'avg'}
		},
		["bg"] = {visible=true,alpha=50,red=0,green=0,blue=0},
		["text"] = {size=10,font="consolas",alpha=255,red=255,green=255,blue=255,stroke={width=1,alpha=200,red=0,green=0,blue=0}},
		["padding"] = 4,
		["flags"] = {draggable=true,right=false,bottom=false,bold=true}
	}
default_settings.display.defense = {
		["visible"] = false,
		["type"] = "defense",
		["pos"] = {x=150,y=440},
		["order"] = L{"block","hit","parry",},
		["max"] = 2,
		["data_types"] = {
			["block"] = S{'avg','percent'},
			["evade"] = S{'percent'},
			["hit"] = S{'avg'},
			["parry"] = S{'percent'},
			["absorb"] = S{'percent'},
			["intimidate"] = S{'percent'},
		},
		["bg"] = {visible=true,alpha=50,red=0,green=0,blue=0},
		["text"] = {size=10,font="consolas",alpha=255,red=255,green=255,blue=255,stroke={width=1,alpha=200,red=0,green=0,blue=0}},
		["padding"] = 4,
		["flags"] = {draggable=true,right=false,bottom=false,bold=true}
	}
default_settings.display.ranged = {
		["visible"] = false,
		["type"] = "offense",
		["pos"] = {x=570,y=200},
		["order"] = L{"damage","ranged","ws"},
		["max"] = 6,
		["data_types"] = {
			["damage"] = S{'total','total-percent'},
			["ranged"] = S{'percent'},
			["r_crit"] = S{'percent'},
			["ws"] = S{'avg'},
		},
		["bg"] = {visible=true,alpha=50,red=0,green=0,blue=0},
		["text"] = {size=10,font="consolas",alpha=255,red=255,green=255,blue=255,stroke={width=1,alpha=200,red=0,green=0,blue=0}},
		["padding"] = 4,
		["flags"] = {draggable=true,right=false,bottom=false,bold=true}
	}
default_settings.display.magic = {
		["visible"] = false,
		["type"] = "offense",
		["pos"] = {x=570,y=50},		
		["order"] = L{"damage","spell"},
		["max"] = 6,
		["data_types"] = {
			["damage"] = S{'total','total-percent'},
			["spell"] = S{'avg'},
		},
		["bg"] = {visible=true,alpha=50,red=0,green=0,blue=0},
		["text"] = {size=10,font="consolas",alpha=255,red=255,green=255,blue=255,stroke={width=1,alpha=200,red=0,green=0,blue=0}},
		["padding"] = 4,
		["flags"] = {draggable=true,right=false,bottom=false,bold=true}
	}
	
settings = config.load(default_settings)

update_tracker,update_interval = 0,settings.update_interval
	
database = {}
filters = {
		['mob'] = S{},
		['player'] = S{}
	}
renames = {}
text_box = {}
pause = false
buffs = {["Palisade"] = false, ["Reprisal"] = false}

stat_types = {}
stat_types.defense = S{"hit","block","evade","parry","intimidate","absorb","shadow","anticipate","nonparry","nonblock","retrate","nonret"}
stat_types.melee = S{"melee","miss","crit"}
stat_types.ranged = S{"ranged","r_miss","r_crit"}
stat_types.category = S{"ws","ja","spell","mb","enfeeb","ws_miss","ja_miss","enfeeb_miss"}
stat_types.other = S{"spike","sc","add", "largest"}
stat_types.multi = S{'1','2','3','4','5','6','7','8'}

dps_clock = require('dpsclock'):new() -- global for now
model = require('model')
require 'utility'
require 'retrieval'
require 'data_channel'
require 'display'
require 'action_parse'
require 'report'
require 'file_handle'

auto_export = nil
auto_export_count = 1

ActionPacket.open_listener(parse_action_packet)

windower.register_event('addon command', function(...)
    local args = {...}
    if args[1] == 'report' then
		report_data(args[2],args[3],args[4])
	elseif (args[1] == 'autoexport') then
		if args[2] then
			message('Autoexport now active under folder '..args[2])
			auto_export = args[2]
			if not windower.dir_exists(windower.addon_path..'data/export/'..auto_export) then
				windower.create_dir(windower.addon_path..'data/export/'..auto_export)
			end
		else
			auto_export = nil
			auto_export_count = 1
			message('Autoexport deactivated')
		end
	elseif (args[1] == 'filter' or args[1] == 'f') and args[2] then
		edit_filters(args[2],args[3],args[4])
		update_texts()
	elseif (args[1] == 'list' or args[1] == 'l') then
		print_list(args[2])
	elseif (args[1] == 'show' or args[1] == 's') then
		toggle_box(args[2])
		update_texts()
	elseif args[1] == 'connect' then
		connect_channel()
		update_texts()
	elseif args[1] == 'reset' then
		check_auto_export()
		dps_clock:reset()
		connect_channel()
		reset_parse()
		update_texts()
	elseif args[1] == 'togglesplit' then
		settings.split_encounters = not settings.split_encounters
		if settings.split_encounters then
			message('Encounters will now be split automatically')
		else
			message('Encounters will no longer automatically split outside of zoning.')
		end
		config.save(settings)
	elseif args[1] == 'pause' or args[1] == 'p' then
		if pause then pause=false else pause=true end
		update_texts()
	elseif args[1] == 'rename' and args[2] and args[3] then
		renames[args[2]:gsub("^%l", string.upper)] = args[3]
		message('Data for player/mob '..args[2]:gsub("^%l", string.upper)..' will now be indexed as '..args[3])	
	elseif args[1] == 'interval' then
		if type(tonumber(args[2]))=='number' then update_tracker,update_interval = 0, tonumber(args[2]) end
		message('Your current update interval is every '..update_interval..' actions.')
	elseif args[1] == 'save' then
		save_parse(args[2])
	elseif args[1] == 'export' and args[2] then
		export_parse(args[2])
	elseif args[1] == 'import' and args[2] then
		import_parse(args[2])
		update_texts()
	else
		message('Command was not found. Valid commands:')
		message('report [stat] [chatmode] :: Reports stat to designated chatmode. Defaults to damage.')
		message('filter/f [add/+ | remove/- | clear/reset] [string] :: Adds/removes/clears mob filter.')
		message('connect :: Manually reconnects the websocket.')
		message('pause/p :: Pauses/unpauses parse. When paused, data is not recorded.')
		message('reset ::  Resets parse.')
		message('rename [player name] [new name] :: Renames a player or monster for NEW incoming data.')
		message('save [file name] :: Saves parse to tab-delimited txt file. Filters are applied and data is collapsed.')
		message('autoexport [folder name] :: Automatically exports a file to this subfolder at the end of every encounter. An empty folder will cancel the auto exporting.')
		message('import/export [file name] :: Imports/exports an xml file to/from database. Filters are applied permanently.')
		message('list/l [mobs/players] :: Lists the mobs and players currently in the database. "mobs" is the default.')
	end
end )

windower.register_event('gain buff', function(id)
	if id==403 then -- Reprisal
		buffs["Reprisal"] = true
	elseif id==478 then -- Palisade
		buffs["Palisade"] = true
	end
end )

windower.register_event('lose buff', function(id)
	if id==403 then -- Reprisal
		buffs["Reprisal"] = false
	elseif id==478 then -- Palisade
		buffs["Palisade"] = false
	end
end )

function get_stat_type(stat)
	for stat_type,stats in pairs(stat_types) do
		if stats:contains(stat) then
			return stat_type
		end
	end
	return nil
end

function reset_parse()
	database = {}
end

function toggle_box(box_name)
	if not box_name then
		box_name = 'melee'
	end
	if text_box[box_name] then
		if settings.display[box_name].visible then
			text_box[box_name]:hide()
			settings.display[box_name].visible = false
		else
			text_box[box_name]:show()
			settings.display[box_name].visible = true
		end
	else
		message('That display was not found. Display names are: melee, defense, ranged, magic.')
	end
end

function edit_filters(filter_action,str,filter_type)
	if not filter_type or not filters[filter_type] then
		filter_type = 'mob'
	end
	
	if filter_action=='add' or filter_action=="+" then
		if not str then message("Please provide string to add to filters.") return end
		filters[filter_type]:add(str)
		message('"'..str..'" has been added to '..filter_type..' filters.')
	elseif filter_action=='remove' or filter_action=="-" then
		if not str then message("Please provide string to remove from filters.") return end
		filters[filter_type]:remove(str)
		message('"'..str..'" has been removed from '..filter_type..' filters.')
	elseif filter_action=='clear' or filter_action=="reset" then
		filters[filter_type] = S{}
		message(filter_type..' filters have been cleared.')
	end	
end

function get_filters()
	local text = ""
	if filters['mob'] and filters['mob']:tostring()~="{}" then
		text = text .. ('Monsters: ' .. filters['mob']:tostring())
	end
	if filters['player'] and filters['player']:tostring()~="{}" then
		text = text .. ('\nPlayers: ' .. filters['player']:tostring())
	end
	return text
end

function print_list(list_type) 
	if not list_type or list_type=="monsters" then 
		list_type="mobs" 
	end
	
	local lst = S{}
	if list_type=='mobs' then
		lst = get_mobs()
	elseif list_type=='players' then
		lst = get_players()
	else
		message('List type not found. Valid list types: mobs, players')
		return
	end
	
	if lst:length()==0 then message('No data found. Nothing to list!') return end
	
	local msg = ""
	for __,i in pairs(lst) do
		msg = msg .. i .. ', '
	end
	
	msg = msg:slice(1,#msg-2)
	
	msg = prepare_string(msg,100)
	msg['n'] = nil
	
	for i,line in pairs(msg) do
		message(line)
	end
end

function check_auto_export()
	if auto_export then
		export_parse(auto_export..'/encounter'..auto_export_count)
		auto_export_count = auto_export_count + 1
	end
end

-- Returns true if monster, or part of monster name, is found in filter list
function check_filters(filter_type,mob_name)
	if not filters[filter_type] or filters[filter_type]:tostring()=="{}" then
		return true
	end
	for v,__ in pairs(filters[filter_type]) do
		if string.find(string.lower(mob_name),string.lower(v)) then
			return true
		end
	end
	return false
end

local tick_counter = 0
local alliance_iter = S{'p1', 'p2', 'p3', 'p4', 'p5', 'a10', 'a11', 'a12', 'a13', 'a14', 'a15', 'a20', 'a21', 'a22', 'a23', 'a24', 'a25'}

local function update_dps_clock()
    local player = windower.ffxi.get_player()
    local pet
	local alliance_in_combat = false
    if player ~= nil then
        local player_mob = windower.ffxi.get_mob_by_id(player.id)
        if player_mob ~= nil then
            local pet_index = player_mob.pet_index
            if pet_index ~= nil then
                pet = windower.ffxi.get_mob_by_index(pet_index)
            end
        end
    end
	if player ~= nil then
		party = windower.ffxi.get_party()
		for id,_ in pairs(alliance_iter) do
			if party[id] and party[id].mob and party[id].mob.status == 1 then
				alliance_in_combat = true
				break
			end
		end
	end
    if player and (player.in_combat or (pet ~= nil and pet.status == 1)) or alliance_in_combat then
		dps_clock:advance()
		tick_counter = 0
    else
		dps_clock:pause()
		tick_counter = tick_counter + 1
		if tick_counter < 15 then
			update_texts()
		end
		if tick_counter == 15 then
			-- Consider the encounter over, but display the last results as the current value
			update_texts()
			
			if settings.split_encounters then
				dps_clock:reset()
				connect_channel()
				check_auto_export()
				
				reset_parse()
			end
		end
    end
end

config.register(settings, function(settings)
    update_dps_clock:loop(settings.UpdateFrequency)
end)