import fs from 'fs'
import demofile from 'demofile'

fs.readFile("./demofiles/exploit-vs-gtz-bulls-m1-inferno.dem", (err, buffer) => {
    const demoFile = new demofile.DemoFile()

    let demoFileCollated = {
        header: demoFile.header,
        events: new Map(),
        playerInfo: new Map()
    }

    demoFile.on("start", e => {
        demoFileCollated.header = demoFile.header
        console.log("Parsing demo file...")
    })

    demoFile.on("end", e => {
        console.log("Finished parsing!")

        const serialisableCache = {
            header: demoFileCollated.header,
            events: Array.from(demoFileCollated.events),
            playerInfo: Array.from(demoFileCollated.playerInfo)
        }

        const replacer = (key, value) => {
            if(key == '_demo') {
                return undefined
            } else if (key.startsWith("m_")) {
                return undefined
            } else if (key.startsWith("_")) {
                return undefined
            } else if (key.startsWith("DT_")) {
                return undefined
            }
            
            return value
        }

        console.log("Writing header file")
        fs.writeFileSync("./parsed_demos/exploit-vs-gtz-bulls-m1-inferno_header.json", JSON.stringify(serialisableCache.header, replacer), {}, (err) => err ? console.error(err) : null)
        console.log("Done")

        console.log("Writing header file")
        fs.writeFileSync("./parsed_demos/exploit-vs-gtz-bulls-m1-inferno_events.json", JSON.stringify(serialisableCache.events, replacer), {}, (err) => err ? console.error(err) : null)
        console.log("Done")

        console.log("Writing header file")
        fs.writeFileSync("./parsed_demos/exploit-vs-gtz-bulls-m1-inferno_playerInfo.json", "", {}, (err) => err ? console.error(err) : null)

        const fileStream = fs.createWriteStream("./parsed_demos/exploit-vs-gtz-bulls-m1-inferno_playerInfo.json")
        serialisableCache.playerInfo.forEach(([key, value]) => {
            fileStream.write(
                JSON.stringify([key, value], replacer), (err) => err ? console.error(err) : null
            )
        })
        console.log("Done")
    })

    // The events we want to keep track of
    const eventsList = [
        //"event",
        // "achievement_earned",
        // "announce_phase_end",
        // "begin_new_match",
        "bomb_begindefuse",
        "bomb_beginplant",
        "bomb_defused",
        "bomb_dropped",
        // "bomb_exploded",
        // "bomb_pickup",
        "bomb_planted",
        // "bot_takeover",
        "buytime_ended",
        // "choppers_incoming_warning",
        // "cs_game_disconnected",
        // "cs_match_end_restart",
        // "cs_pre_restart",
        // "cs_round_final_beep",
        // "cs_round_start_beep",
        // "cs_win_panel_match",
        // "cs_win_panel_round",
        // "decoy_detonate",
        // "decoy_started",
        // "defuser_dropped",
        "defuser_pickup",
        // "dm_bonus_weapon_start",
        // "endmatch_cmm_start_reveal_items",
        // "endmatch_mapvote_selecting_map",
        // "firstbombs_incoming_warning",
        "flashbang_detonate",
        // "game_newmap",
        "hegrenade_detonate",
        // "hltv_chat", "hltv_status",
        // "hostage_hurt",
        // "hostage_killed",
        // "hostage_rescued",
        // "hostage_rescued_all",
        // "inferno_expire",
        "inferno_startburn",
        // "item_equip",
        // "item_found",
        "item_pickup",
        // "item_remove",
        // "items_gifted",
        // "other_death",
        "player_blind",
        // "player_changename",
        // "player_chat",
        // "player_connect",
        // "player_connect_full",
        "player_death",
        // "player_disconnect",
        // "player_falldamage",
        // "player_footstep",
        "player_hurt",
        // "player_info",
        // "player_jump",
        // "player_spawn",
        // "player_team",
        // "round_announce_final",
        // "round_announce_last_round_half",
        // "round_announce_match_point",
        // "round_announce_match_start",
        // "round_announce_warmup",
        "round_end",
        // "round_freeze_end",
        "round_mvp",
        // "round_officially_ended",
        "round_poststart",
        // "round_prestart",
        // "round_start",
        // "round_time_warning",
        // "seasoncoin_levelup", "server_cvar",
        // "server_spawn",
        "smokegrenade_detonate",
        // "smokegrenade_expired",
        // "survival_paradrop_break", "survival_paradrop_spawn", "teamplay_broadcast_audio", "tournament_reward",
        "weapon_fire",
        // "weapon_fire_on_empty",
        // "weapon_outofammo",
        // "weapon_reload",
        // "weapon_zoom"
    ]

    for(let event of eventsList) {
        demoFile.gameEvents.on(event, e => {
            // console.log(event, e)
            demoFileCollated.events = demoFileCollated.events.set(demoFile.currentTick, {event, ...e})
            demoFileCollated.playerInfo = demoFileCollated.playerInfo.set(demoFile.currentTick, demoFile.players.map(player => getStaticPlayer(player)))
        })
    }

    demoFile.parse(buffer)
})

function decycle(obj, stack = []) { // RangeError, I think it's making an array that's too large
    if (!obj || typeof obj !== 'object')
        return obj;
    
    if (stack.includes(obj))
        return null;

    let s = stack.concat([obj]);

    return Array.isArray(obj)
        ? obj.map(x => decycle(x, s))
        : Object.fromEntries(
            Object.entries(obj)
                .map(([k, v]) => [k, decycle(v, s)]));
}

const getStaticPlayer = (player) => {
    // console.log(player)
    // let getters = Object.entries(Object.getOwnPropertyDescriptors(Object.getPrototypeOf(player)))
    // .filter(([key, descriptor]) => typeof descriptor.get === 'function' && key !== "crosshairInfo")
    // .map(([key, descriptor]) => {
    //     // if (key === "weapon") {
    //     //     const value = descriptor.get.bind(player)()
    //     //     value._demo = null
    //     //     console.log(JSON.stringify(value))
    //     // }
    //     return [key, descriptor.get.bind(player)()]
    // })

    // getters.forEach(([key, value]) => {
    //     try {
    //         value._demo = undefined
    //     }
    //     catch(e) { }
    // })
    
    // return getters
    return {
        health: player.health,
        eyeAngles: player.eyeAngles,
        position: player.position,
        velocity: player.velocity,
        // speed: player.speed,
        // account: player.account,
        // lifeState: player.lifeState,
        // isAlive: player.isAlive,
        // userInfo: player.userInfo,
        userId: player.userId,
        // steamId: player.steamId,
        // steam64Id: player.steam64Id,
        // name: player.name,
        // isFakePlayer: player.isFakePlayer,
        // isHltv: player.isHltv,
        armor: player.armor,
        // placeName: player.placeName,
        weapon: player.weapon,
        weapons: player.weapons,
        // isInBombZone: player.isInBombZone,
        // isInBuyZone: player.isInBuyZone,
        isDefusing: player.isDefusing,
        hasDefuser: player.hasDefuser,
        hasHelmet: player.hasHelmet,
        // isControllingBot: player.isControllingBot,
        kills: player.kills,
        assists: player.assists,
        deaths: player.deaths,
        // cashSpendThisRound: player.cashSpendThisRound,
        // cashSpendTotal: player.cashSpendTotal,
        hasC4: player.hasC4,
        // score: player.score,
        // mvps: player.mvps,
        // clanTag: player.clanTag,
        isSpotted: player.isSpotted,
        // allSpotters: player.allSpotters,
        // allSpotted: player.allSpotted,
        isScoped: player.isScoped,
        isWalking: player.isWalking,
        // isDucking: player.isDucking,
        isDucked: player.isDucked,
        flashDuration: player.flashDuration,
        currentEquipmentValue: player.currentEquipmentValue,
        // roundStartEquipmentValue: player.roundStartEquipmentValue,
        // freezeTimeEndEquipmentValue: player.freezeTimeEndEquipmentValue,
        // matchStats: player.matchStats,
        // crosshairInfo: player.crosshairInfo
    }
}