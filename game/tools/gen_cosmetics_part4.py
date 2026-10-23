"""Part 4 — catalog definition + main()."""

# item_id -> {slot, name, rarity, unlock, price, desc, canvases}
# slot: headgear | gloves | kicks | accessory | facepaint | eyes
# rarity: Street | Rare | Epic | Legendary
# unlock: {type: shop|season|boss, price?, season?, boss?}
# canvases: which 256px overlay canvases this item ships per fighter
#   head / torso / arm_f / leg_s
CATALOG = {
    # ---- headgear ----
    "skimask_ink":   {"slot": "headgear", "name": "Ink Ski Mask", "rarity": "Street",
                      "unlock": {"type": "shop", "price": 150}, "canvases": ["head"],
                      "desc": "Full-face ink balaclava. Nobody knows."},
    "bandana_crimson": {"slot": "headgear", "name": "Crimson Bandana", "rarity": "Street",
                      "unlock": {"type": "shop", "price": 150}, "canvases": ["head"],
                      "desc": "Barrio colors, tied tight."},
    "hoodie_up":     {"slot": "headgear", "name": "Up Hoodie", "rarity": "Street",
                      "unlock": {"type": "shop", "price": 200}, "canvases": ["head", "torso"],
                      "desc": "Hood up. Neon downtown uniform."},
    "mohawk_ink":    {"slot": "headgear", "name": "Ink Mohawk", "rarity": "Street",
                      "unlock": {"type": "shop", "price": 200}, "canvases": ["head"],
                      "desc": "Shaved sides, lightning attitude."},
    "hockey_mask":   {"slot": "headgear", "name": "Rink Mask", "rarity": "Rare",
                      "unlock": {"type": "shop", "price": 450}, "canvases": ["head"],
                      "desc": "Goalie mask, street rules."},
    "puffer_hood":   {"slot": "headgear", "name": "Rust Puffer Hood", "rarity": "Rare",
                      "unlock": {"type": "shop", "price": 450}, "canvases": ["head", "torso"],
                      "desc": "Rust-belt winter armor."},
    "hoodvest":      {"slot": "headgear", "name": "Hooded Vest", "rarity": "Rare",
                      "unlock": {"type": "shop", "price": 400}, "canvases": ["head", "torso"],
                      "desc": "Sleeveless. Arms stay free."},
    "locs_long":     {"slot": "headgear", "name": "Long Locs", "rarity": "Rare",
                      "unlock": {"type": "shop", "price": 400}, "canvases": ["head"],
                      "desc": "Crown weight, worn long."},
    "fade_design":   {"slot": "headgear", "name": "Lightning Fade", "rarity": "Epic",
                      "unlock": {"type": "shop", "price": 800}, "canvases": ["head"],
                      "desc": "Fade with the bolt carved in."},
    "lucha_barrio":  {"slot": "headgear", "name": "Barrio Lucha", "rarity": "Epic",
                      "unlock": {"type": "shop", "price": 900}, "canvases": ["head"],
                      "desc": "Generic lucha pattern — teal and pink diamonds."},
    "wolf_head":     {"slot": "headgear", "name": "Wolf Head", "rarity": "Epic",
                      "unlock": {"type": "season", "season": "halloween"}, "canvases": ["head"],
                      "desc": "Halloween season reward. Hunt at full moon."},
    "tiger_head":    {"slot": "headgear", "name": "Tiger Head", "rarity": "Legendary",
                      "unlock": {"type": "boss", "boss": 3}, "canvases": ["head"],
                      "desc": "Beat the zone-3 boss to wear the stripes."},
    # ---- gloves ----
    "gloves_neon":   {"slot": "gloves", "name": "Neon Synthetics", "rarity": "Street",
                      "unlock": {"type": "shop", "price": 200}, "canvases": ["arm_f"],
                      "desc": "Hot pink / cyan fight synthetics."},
    "gloves_work":   {"slot": "gloves", "name": "Work Leather", "rarity": "Street",
                      "unlock": {"type": "shop", "price": 200}, "canvases": ["arm_f"],
                      "desc": "Industrial leather. Built to last."},
    "gloves_canvas": {"slot": "gloves", "name": "Boardwalk Canvas", "rarity": "Rare",
                      "unlock": {"type": "shop", "price": 450}, "canvases": ["arm_f"],
                      "desc": "Canvas wraps, boardwalk edition."},
    "gloves_gold":   {"slot": "gloves", "name": "Gold-Trim", "rarity": "Epic",
                      "unlock": {"type": "shop", "price": 850}, "canvases": ["arm_f"],
                      "desc": "Black and gold. Championship energy."},
    "gloves_dragon": {"slot": "gloves", "name": "Dragon-Scale", "rarity": "Legendary",
                      "unlock": {"type": "boss", "boss": 5}, "canvases": ["arm_f"],
                      "desc": "Scale plating. Endgame hands."},
    # ---- kicks ----
    "kicks_canvas":  {"slot": "kicks", "name": "Boardwalk Hi-Tops", "rarity": "Street",
                      "unlock": {"type": "shop", "price": 200}, "canvases": ["leg_s"],
                      "desc": "Canvas hi-tops, pier-tested."},
    "kicks_workboot": {"slot": "kicks", "name": "Work Boots", "rarity": "Street",
                      "unlock": {"type": "shop", "price": 200}, "canvases": ["leg_s"],
                      "desc": "Steel attitude, leather boots."},
    "kicks_neon":    {"slot": "kicks", "name": "Neon Runners", "rarity": "Rare",
                      "unlock": {"type": "shop", "price": 450}, "canvases": ["leg_s"],
                      "desc": "Downtown after dark."},
    "kicks_gold":    {"slot": "kicks", "name": "Gold Hi-Tops", "rarity": "Epic",
                      "unlock": {"type": "shop", "price": 850}, "canvases": ["leg_s"],
                      "desc": "Black and gold, laced tight."},
    # ---- accessory (multi-equip: chains on torso, wrist pads on arms) ----
    "chain_dogtags": {"slot": "accessory", "name": "Dog Tags", "rarity": "Street",
                      "unlock": {"type": "shop", "price": 150}, "canvases": ["torso"],
                      "desc": "Stamped steel. Earned, not bought. (Bought.)"},
    "wristpad_neon": {"slot": "accessory", "name": "Neon Wrist Pads", "rarity": "Street",
                      "unlock": {"type": "shop", "price": 150}, "canvases": ["arm_f"],
                      "desc": "Wrap the wrists, protect the money-makers."},
    "chain_curb":    {"slot": "accessory", "name": "Curb Chain", "rarity": "Rare",
                      "unlock": {"type": "shop", "price": 500}, "canvases": ["torso"],
                      "desc": "Chunky gold curb links."},
    "wristpad_leather": {"slot": "accessory", "name": "Leather Wraps", "rarity": "Rare",
                      "unlock": {"type": "shop", "price": 400}, "canvases": ["arm_f"],
                      "desc": "Old-school leather wrist wraps."},
    "medal_saint":   {"slot": "accessory", "name": "Saint Medallion", "rarity": "Epic",
                      "unlock": {"type": "season", "season": "takeover"}, "canvases": ["torso"],
                      "desc": "Season-pass relic. Blessed by the block."},
    # ---- face paint ----
    "paint_cornerman": {"slot": "facepaint", "name": "Cornerman Stripes", "rarity": "Street",
                      "unlock": {"type": "shop", "price": 150}, "canvases": ["head"],
                      "desc": "Fight-night tape stripes."},
    "paint_war":     {"slot": "facepaint", "name": "War Paint", "rarity": "Rare",
                      "unlock": {"type": "shop", "price": 400}, "canvases": ["head"],
                      "desc": "Black band, red slashes. Business."},
    "paint_tag":     {"slot": "facepaint", "name": "Cheek Tag", "rarity": "Rare",
                      "unlock": {"type": "shop", "price": 400}, "canvases": ["head"],
                      "desc": "Wildstyle CD on the cheek."},
    "paint_sugarskull": {"slot": "facepaint", "name": "Sugar Skull", "rarity": "Epic",
                      "unlock": {"type": "season", "season": "halloween"}, "canvases": ["head"],
                      "desc": "Day of the Dead. Halloween season reward."},
    # ---- eyes ----
    "eyes_amber":    {"slot": "eyes", "name": "Amber Eyes", "rarity": "Rare",
                      "unlock": {"type": "shop", "price": 350}, "canvases": ["head"],
                      "desc": "Predator amber."},
    "eyes_ice":      {"slot": "eyes", "name": "Ice Eyes", "rarity": "Rare",
                      "unlock": {"type": "shop", "price": 350}, "canvases": ["head"],
                      "desc": "Glacier stare."},
    "eyes_violet":   {"slot": "eyes", "name": "Violet Eyes", "rarity": "Epic",
                      "unlock": {"type": "shop", "price": 750}, "canvases": ["head"],
                      "desc": "Neon-district violet."},
    "eyes_hollow":   {"slot": "eyes", "name": "Hollow Glow", "rarity": "Legendary",
                      "unlock": {"type": "boss", "boss": 7}, "canvases": ["head"],
                      "desc": "Hollow Point's glow. Boss-tier eyes."},
}

# item_id -> painter function name (defined in parts 2/3)
PAINTERS = {
    "skimask_ink": "p_skimask", "bandana_crimson": "p_bandana",
    "hoodie_up": "p_hoodie", "mohawk_ink": "p_mohawk",
    "hockey_mask": "p_hockey", "puffer_hood": "p_puffer", "hoodvest": "p_hoodvest",
    "locs_long": "p_locs", "fade_design": "p_fade", "lucha_barrio": "p_lucha",
    "wolf_head": "p_wolf", "tiger_head": "p_tiger",
    "paint_cornerman": "p_paint_cornerman", "paint_war": "p_paint_war",
    "paint_tag": "p_paint_tag", "paint_sugarskull": "p_paint_sugarskull",
    "eyes_amber": "p_eyes_amber", "eyes_ice": "p_eyes_ice",
    "eyes_violet": "p_eyes_violet", "eyes_hollow": "p_eyes_hollow",
    "gloves_neon": "p_gloves_neon", "gloves_work": "p_gloves_work",
    "gloves_canvas": "p_gloves_canvas", "gloves_gold": "p_gloves_gold",
    "gloves_dragon": "p_gloves_dragon",
    "kicks_canvas": "p_kicks_canvas", "kicks_workboot": "p_kicks_workboot",
    "kicks_neon": "p_kicks_neon", "kicks_gold": "p_kicks_gold",
    "chain_dogtags": "p_chain_dogtags", "chain_curb": "p_chain_curb",
    "medal_saint": "p_medal_saint",
    "wristpad_neon": "p_wristpad_neon", "wristpad_leather": "p_wristpad_leather",
}
TORSO_PAINTERS = {"hoodie_up": "p_hoodie_torso", "puffer_hood": "p_puffer_torso",
                  "hoodvest": "p_hoodvest_torso"}


def write_catalog():
    out = {"schema": 1, "slots": ["headgear", "gloves", "kicks", "accessory", "facepaint", "eyes"],
           "rarities": ["Street", "Rare", "Epic", "Legendary"],
           "cosmetic_only": True,
           "items": {k: {kk: vv for kk, vv in v.items()} for k, v in CATALOG.items()}}
    p = os.path.join(GAME, "assets", "customize", "catalog.json")
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w") as fh:
        json.dump(out, fh, indent=2)
    return p


def main():
    made = []
    for item_id, spec in CATALOG.items():
        for fighter in FIGHTERS:
            for canvas in spec["canvases"]:
                if canvas == "torso" and item_id in TORSO_PAINTERS:
                    fn = TORSO_PAINTERS[item_id]
                else:
                    fn = PAINTERS[item_id]
                img = globals()[fn](fighter)
                made.append(save(img, fighter, item_id if canvas == spec["canvases"][0]
                                 else "%s_%s" % (item_id, canvas)))
    cp = write_catalog()
    print("wrote %d PNGs + %s" % (len(made), cp))


if __name__ == "__main__":
    main()
