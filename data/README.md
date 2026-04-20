# Last Scrap Data Layer

These files are the canonical version-1 gameplay data sources for **Last Scrap**.

## Files
- `balance_constants.json` — top-level tuning values and locked percentages
- `enemy_definitions.json` — Shambler, Brute, Runner
- `upgrade_definitions.json` — Combat, Survival, Rig, Economy upgrades
- `wave_rules.json` — waves 1 through 10 and their rewards/compositions
- `game_state_map.json` — top-level states and allowed transitions

## Purpose
These files are intended to keep the build data-driven and prevent important gameplay values from being buried across unrelated files.

## Rules
- Treat these files as the source of truth for version-1 balancing
- Do not introduce ranged/spit enemies into version 1
- Do not change the locked end-state loss percentages without explicitly updating the master spec
