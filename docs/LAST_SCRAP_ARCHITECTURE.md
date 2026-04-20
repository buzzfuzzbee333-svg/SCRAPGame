# Last Scrap — Architecture

## Architecture choice
Use a **data-driven, event-assisted state architecture**.

That means:
- permanent values live in save/meta data
- current run values live in a run-state object
- enemies and upgrades are defined in data tables
- systems react to state and events rather than mutating everything ad hoc

## High-level layers
### 1. Static Definitions
- enemy definitions
- upgrade definitions
- wave rules
- balance constants

### 2. Persistent Meta State
- secured scrap total
- upgrade levels
- lifetime stats
- settings

### 3. Active Run State
- wave number
- unsecured scrap
- player current HP
- rig current integrity
- enemies alive
- run status
- cause of failure

### 4. Systems
- player system
- enemy system
- combat system
- rig system
- wave system
- economy system
- progression system
- UI system

### 5. Presentation
- HUD
- menus
- upgrade cards
- result screens
- feedback effects

## System ownership
### Game State Controller
Owns top-level state transitions, run start, run end, and routing.

### Player System
Owns movement, attack timing, damage intake, and death trigger.

### Enemy System
Owns enemy instances, movement, contact attack timing, and death signal.

### Combat System
Owns damage formula, hit resolution, and cooldown enforcement.

### Rig System
Owns rig integrity, rig damage intake, passive scrap timer source, and overrun detection.

### Wave System
Owns wave number, spawn schedule, wave completion detection, and cashout-window trigger.

### Economy System
Owns unsecured scrap gain, secured scrap addition, reward formulas, and failure/cashout resolution math.

### Progression System
Owns upgrade definitions, purchase checks, level caps, and applying meta bonuses to new run state.

### UI System
Owns rendering values already calculated elsewhere and player input on menus/buttons.

## Canonical data contracts
### EnemyDefinition
- id
- name
- maxHealth
- attack
- defense
- speed
- contactRange
- attackCooldown
- rewardScrap
- aggroRadius
- targetPriorityBehavior

### UpgradeDefinition
- id
- name
- category
- description
- baseCost
- costStep
- levelCap
- effectType
- effectPerLevel
- applyMode

### PlayerRunState
- currentHealth
- maxHealth
- attack
- defense
- moveSpeed
- attackRate
- isDead

### RigRunState
- currentIntegrity
- maxIntegrity
- defense
- passiveScrapTickValue
- passiveScrapTickInterval
- isOverrun

### RunState
- runStatus
- causeOfFailure
- waveIndex
- unsecuredScrap
- bankedScrapFromRun
- lostScrapFromRun
- enemiesAliveCount
- cashoutWindowOpen
- elapsedRunTime

### MetaState
- securedScrap
- upgradeLevels
- lifetimeStats
- settings

## Exact run-start pipeline
1. Load meta state
2. Read upgrade levels
3. Create fresh run state with defaults
4. Apply upgrade bonuses to player and rig run stats
5. Set wave index to 1
6. Set unsecured scrap to 0
7. Clear prior enemy instances
8. Spawn player and rig
9. Dispatch RUN_STARTED
10. Dispatch WAVE_STARTED for wave 1
11. Begin active gameplay

## Exact run-end pipeline
All run endings must converge into one resolver.
1. Freeze active gameplay
2. Compute lost and banked scrap based on end type
3. Add banked scrap to secured scrap
4. Update lifetime stats
5. Save meta state
6. Clear unsecured scrap
7. Populate run summary model
8. Dispatch RUN_ENDED
9. Transition to end-of-run screen

## Recommended module plan
### Core
- game_state_controller
- run_state_store
- meta_state_store
- event_bus
- balance_constants

### Gameplay
- player_system
- enemy_system
- combat_system
- rig_system
- wave_system
- economy_system
- progression_system

### Data
- enemy_definitions
- upgrade_definitions
- wave_rules

### UI
- title_screen
- pre_run_screen
- hud_screen
- cashout_modal
- run_summary_screen
- upgrade_screen

### Persistence
- save_manager
- stats_manager

## Interaction rules
- UI reads from state stores and dispatches actions
- Combat resolution happens in one place
- Run-end resolution happens in one place
- Upgrade effects are applied through progression at run start
- Wave completion is determined by the wave system, not the HUD
