# Last Scrap — Master Spec

## Build objective
Create a compact, stable vertical slice of **Last Scrap**: zombie survival plus idle scrap tension centered around a rig defense loop.

## Core loop
1. Start run
2. Spawn player near central rig
3. Survive zombie waves
4. Earn unsecured scrap from kills, wave clears, and small passive rig-linked generation
5. Choose to **Cash Out** or **Continue** after each wave
6. Resolve loss based on end state
7. Spend secured scrap on permanent upgrades between runs

## Locked end states
- **Cash Out:** bank 100% of unsecured scrap
- **Rig Overrun:** lose 50%, bank 50%
- **Player Death:** lose 100%
- **Surrender/Quit:** lose 60%, bank 40%

## Locked early combat rules
- Contact/proximity zombie attacks only in version 1
- No ranged/spit attacks yet
- Every enemy type must have its own attack, defense, and speed
- Use one centralized damage formula:

```text
final_damage = max(1, attacker_attack - target_defense)
```

## Core currencies
### Unsecured Scrap
- earned during the run
- visible on HUD
- at risk until banked

### Secured Scrap
- permanent meta currency
- used for upgrades
- persists across sessions

## Baseline player stats
- Max HP: 50
- Attack: 7
- Defense: 1
- Move Speed: 1.25
- Attack Rate: 0.7 sec

## Baseline rig stats
- Max Integrity: 120
- Defense: 0
- Passive Scrap Tick: 1 every 4 sec

## Enemy roster
### Shambler
- Role: basic pressure
- HP: 20
- Attack: 4
- Defense: 1
- Speed: 1.0
- Contact Range: 1.0
- Attack Cooldown: 1.2 sec
- Reward Scrap: 4

### Brute
- Role: tanky threat
- HP: 40
- Attack: 8
- Defense: 3
- Speed: 0.7
- Contact Range: 1.1
- Attack Cooldown: 1.5 sec
- Reward Scrap: 8

### Runner
- Role: positioning punish
- HP: 16
- Attack: 5
- Defense: 0
- Speed: 1.6
- Contact Range: 0.9
- Attack Cooldown: 0.9 sec
- Reward Scrap: 5

## Wave table v1
- Wave 1: 4 Shamblers — Reward 10
- Wave 2: 6 Shamblers — Reward 15
- Wave 3: 6 Shamblers, 1 Brute — Reward 20
- Wave 4: 8 Shamblers, 1 Brute — Reward 25
- Wave 5: 8 Shamblers, 2 Brutes, 1 Runner — Reward 30
- Wave 6: 10 Shamblers, 2 Brutes, 2 Runners — Reward 35
- Wave 7: 12 Shamblers, 2 Brutes, 2 Runners — Reward 40
- Wave 8: 12 Shamblers, 3 Brutes, 2 Runners — Reward 45
- Wave 9: 14 Shamblers, 3 Brutes, 3 Runners — Reward 50
- Wave 10: 16 Shamblers, 3 Brutes, 4 Runners — Reward 55

## Upgrade categories
### Combat
- Weapon Damage: +1 attack per level; base cost 20; step 10; cap 10
- Attack Speed: -0.03 sec interval per level; base cost 25; step 12; cap 8

### Survival
- Max Health: +5 HP per level; base cost 20; step 10; cap 10
- Defense Plating: +1 defense per level; base cost 25; step 15; cap 6
- Boots: +0.05 move speed per level; base cost 20; step 12; cap 6

### Rig
- Rig Integrity: +15 rig HP per level; base cost 25; step 15; cap 8
- Rig Reinforcement: +1 rig defense per level; base cost 30; step 18; cap 5

### Economy
- Salvage Multiplier: +10% kill and wave scrap per level; base cost 30; step 20; cap 8
- Rig Output: passive scrap improves every 2 levels; base cost 35; step 20; cap 6

## Top-level game states
- Title
- Pre-Run Loadout
- In Run
- End of Run Summary
- Upgrade Screen

### In-run substates
- Run Start
- Wave Active
- Cashout Window
- Player Death Resolution
- Rig Overrun Resolution
- Pause

## Acceptance gate
Do not expand the game until all of these are true:
- run starts cleanly
- run ends cleanly
- contact damage works correctly
- enemy stat identity is obvious in play
- rig overrun triggers exactly once and banks the correct remainder
- player death banks 0 from unsecured scrap
- cashout banks 100% correctly
- secured scrap persists
- upgrades persist and affect the next run
- HUD clearly shows player HP, rig integrity, wave number, and unsecured scrap
