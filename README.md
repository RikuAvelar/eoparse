# Eoparse

An FFXI addon and external parser, inspired by [MopiMopi](https://github.com/HAERUHAERU/mopimopi), [Parse](https://github.com/flippant/parse) and [Scoreboard](https://github.com/Windower/Lua/tree/live/addons/scoreboard) as its basis.

The addon works by emulating the packets expected by an FFXIV ACT-Websocket compliant UI using data from within FFXI. However, the packets have since been customized to also add some items that are not normally present in FFXIV.

# How to use

The releases contain 2 folders, Eoparse and Eoparse-UI. Eoparse should be placed in your addons folder and loaded through lua, while the Eoparse UI can be placed elsewhere on your computer. This latter folder contains the external UI that needs to be run separately. The UI itself is essentially an FFXIV parser, so a lot of its options will likely not make much sense in FFXI's context.

The addon will try to connect to the UI every 30 seconds whenever a fight begins, or each time you zone. If it doesn't detect it, you might get a couple of lag spikes, so it's recommended you unload it if you don't plan on using it.

Here's a couple of commands that may be useful:

- `eop reset` : Resets and ends the current encounter. The UI will count the next one as a separate encounter (you can see the previous one in its history before closing the app) but the addon will completely forget the old one.
- `eop export {filename}`: Saves the current encounter to a file. Files will be saved to the `addons/eoparse/data` folder. They can be later loaded with `eop import {filename}`.
- `eop autoexport {folder name}` : Starts a sort of "recording session" in the parser, automatically saving files to the `addons/eoparse/data/FOLDER_NAME` folder each time an encounter ends (either automatically or via the reset function`
- `eop connect` : Forces a connection attempt. Do note that even if no connection is made, fights are recorded, so as soon as you run the UI and the addon connects, you will have the latest data.

Here's a couple of interesting controls in the UI that can be used:

- **Capture**: Saves a screenshot of the current parse to your `eoparse-ui/captures` folder. Only captures what's visible, so it won't see everyone's data at the same time.
- **History**: Shows a history of fights that the UI remembers. Note that the data tends to be a bit buggy when viewed in the past
- **Combine Pets** : Combines/Separates damage from Pets and Skillchains. Due to how the packet is parsed currently for skillchains, a single skillchain may sometimes be attributed to multiple people.