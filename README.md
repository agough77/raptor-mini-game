# 🦖 Raptor Chase - Mini Game

Two browser games about outlasting prehistoric raptors, built with plain HTML5 canvas and JavaScript:

- **Raptor Chase** (`raptor.html`): top-down survival across 11 themed lands.
- **Raptor Destroy** (`raptor-destroy.html`): a vertical shooter with waves, power levels and Alpha boss packs.

## 🎮 How to Play

Open `raptor.html` or `raptor-destroy.html` in a modern browser, or play them on GitHub Pages. Keep the files together in one folder: both games load the shared `raptor-common.js` and `raptor-ui.css`.

### Controls (both games)
- **WASD / Arrow Keys**: move
- **Shift**: sprint (uses stamina; run it dry and you have to recover before sprinting again)
- **Spacebar**: dash (short burst with a moment of invulnerability)
- **P / Esc**: pause (the game also pauses itself when you switch tabs)
- **M**: mute
- **Enter**: start, or play again from the game over screen
- **Touch**: on-screen joystick, plus Sprint and Dash buttons

Your gun fires automatically at the nearest raptor.

### 🎚️ Difficulty
Pick a difficulty on the start screen. Each one has its own Top 10.
- **Easy**: the standard game.
- **Hard**: faster, tougher raptors and fewer pick-ups. In Chase, raptors lunge more often and come in bigger packs. In Destroy, raptors spit more, hits hurt more and healing is scarcer.
- **Yep, Try This 💀**: raptors are faster than your run speed from the first second, so you have to sprint and dash to stay alive. In Chase, packs are bigger, spawns land closer with less warning, and stamina recovers slower. In Destroy, raptors are much tougher, hits do double damage, spit is everywhere and healing is rare. Reach level/wave 5 for the "Yep, Tried It" achievement.

## 🦖 Raptor Chase

Survive as long as you can. Raptors are telegraphed with a red **!** before they appear, so they never spawn on top of you.

**Watch for lunges:** when a raptor gets close it crouches and flashes red, then leaps in a straight line. The direction is locked when it crouches, so sidestep or dash.

### 🌍 11 Themed Environments
| Levels | Theme | Hazard |
|---|---|---|
| 1-4 | Jungle | Quicksand slows you down |
| 5-9 | Desert | Sandstorms swirl you and the raptors around |
| 10-14 | Arctic | Ice: you lose grip and slide |
| 15-19 | Volcano | Lava drains stamina, and burns up raptors that wander in |
| 20-24 | Night | Fog hides the raptors inside it |
| 25-29 | Swamp | Sticky mud |
| 30-39 | Canyon | Boulders block you and the raptors (use them as cover) |
| 40-49 | Storm | Tornadoes pull everything toward their centre |
| 50-74 | Lava | Extreme lava pools |
| 75-99 | Void | Vortexes pull everything in |
| 100+ | Rainbow | Rainbow rings restore stamina and give bonus points |

### ⚡ Power-ups
- **🛡️ Shield** (4s): raptors that touch you are destroyed
- **⚡ Speed** (5s): move 50% faster
- **❄️ Freeze** (3s): raptors stop, and touching one shatters it

### 🔫 Weapons (8 seconds each)
Star, Spiral, Shotgun, Laser, Circle, X-Pattern, Wave, Rapid, Sniper (pierces through a line of raptors), Chaos.

### 💣 Bombs
A bomb falls every 20 seconds. Its landing zone is marked on the ground, so lure raptors into it. Bombs don't hurt you.

### 🏆 Scoring
- Survival: 1 point per frame (60 per second)
- Kills: 30 points, bomb kills 20 points
- **Combos**: chain kills within 2.5 seconds. 8+ kills doubles points, 16+ triples them.
- Each level takes a little longer than the last. Raptors get faster (late on they outrun you unless you sprint), come in bigger packs, and from level 2 some take two hits (three from level 12).

### 🧪 Testing levels
Keys **1-9, 0, -** jump to each theme (levels 1, 5, 10, 15, 20, 25, 30, 40, 50, 75, 100). Runs that use them are marked as practice, and their scores and achievements aren't saved.

## 🚀 Raptor Destroy

- Raptors attack in 3-raptor formations that weave, dive and loop. Get close and they'll chase you at almost your speed.
- **Spitters**: from wave 2, some raptors spit glowing green shots at you (10 damage). More of them show up each wave.
- **Waves** advance by kills. Themes change as you progress, each with its own hazard.
- **Power levels**: kills charge your Power bar. Each full bar raises your power level (up to 5) for faster fire and more damage. Getting hit drains the bar, and at empty it knocks you down a level.
- **Weapons**: Double, Triple, Spread, Star, Spiral, Circle, Wave, Laser and Chaos drop from raptors and from the sky. They last until you pick up another.
- **Alpha packs**: every 10th wave, three huge Alpha raptors attack. They fire spreads of spit, and charge along a red line, so dash out of the way. Beating a pack heals 25 HP.
- **Combos**: 10+ kills double points, 25+ triple them. Taking damage breaks your combo.

## ✨ Both games
- Synthesized sound effects (no audio files needed), screen shake, hit flashes, particles and floating score text. Sound and screen shake can be turned off in the menu or pause screen.
- Top 10 leaderboard per game, saved automatically when you die. Type your name on the game over screen to update your entry.
- Achievements and lifetime stats on the start screen.
- Runs at the same speed on 60Hz, 120Hz and 144Hz screens.

## 🎨 Custom Backgrounds
Each theme loads a JPEG from the game folder: `jungle.jpeg`, `desert.jpeg`, `arctic.jpeg`, `volcano.jpeg`, `night.jpeg`, `swamp.jpeg`, `canyon.jpeg`, `storm.jpeg`, `lava.jpeg`, `void.jpeg`, `rainbow.jpeg`. Replace them with your own. If one is missing, the theme falls back to a colour gradient.

## 📝 Files
- `raptor.html`: Raptor Chase
- `raptor-destroy.html`: Raptor Destroy
- `raptor-common.js`: shared game loop, sound, effects, leaderboards and achievements
- `raptor-ui.css`: shared menus, HUD and touch controls
- `raptor_original.html`: original version backup

## 🛠️ Technical Details
- Pure HTML5, CSS3 and vanilla JavaScript, with no external dependencies
- Canvas rendering on a fixed 60-step-per-second game loop
- Local storage for scores, achievements, stats and settings

## 📜 License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---
Made with ❤️ for raptor enthusiasts and arcade game lovers!
