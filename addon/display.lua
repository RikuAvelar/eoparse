--[[ TO DO

	-- Update filter header directly

]]

function update_texts()
    local filters = update_filters()
    local data = create_combat_message(filters)
    local str_data = json.encode(data)
    -- print(json.encode(data))
    -- local inspect = require('inspect')
    -- print(dump(data))
    -- print('sending data')
	-- windower.add_to_chat(8, str_data)
	maintain_connection()
	send_data(str_data)
end

-- I want this to edit the text boxes directly
function update_filters()
	local text = ""
	if filters['mob'] and filters['mob']:tostring()~="{}" then
		text = text .. ('Monsters: ' .. filters['mob']:tostring())
	end
	if filters['player'] and filters['player']:tostring()~="{}" then
		if text ~= '' then
			text = text .. ' | '
		end
		text = text .. ('Players: ' .. filters['player']:tostring())
	end
	return text
end