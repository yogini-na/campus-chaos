# 🎓 Campus Chaos — College Life Simulator
> **A Story-Driven 2D Retro Pixel-Art Engineering College Simulation Game**

![Version](https://img.shields.io/badge/version-1.0.0-cyan.svg)
![Tech Stack](https://img.shields.io/badge/tech-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-magenta.svg)
![Audio](https://img.shields.io/badge/audio-8--bit%20Web%20Audio%20Synth-yellow.svg)

---

## 🎮 Game Concept & Overview
**Campus Chaos** is an interactive, choice-driven 2D browser simulation game that puts you into the shoes of an undergraduate engineering student navigating four pivotal years of college life.

Players must constantly balance five core life pillars:
- 📚 **Academics:** Attendance, internal exams, lab journals, and GPA.
- 💻 **Coding Skills:** Algorithmic problem solving, GitHub open-source, and project architectures.
- ⚡ **Energy & Health:** Sleep, physical wellness, mental resilience, and burnout prevention.
- 🤝 **Relationships:** Hostel friendships, club leadership, alumni connections, and networking.
- 💼 **Career Readiness:** Resumes, cold emails, mock interviews, internships, and placement prep.

Every decision carries tangible consequences, stat trade-offs, and unlockable perks. Across 16 deep interactive story events spanning 4 chapters, your choices will culminate in one of **5 distinct graduation endings**.

---

## 🎨 Visual Style & Aesthetic Design
- **Retro 16-Bit / 8-Bit Pixel Art Style:** Built with rich dark purple (`#0d0b18`) and midnight navy backgrounds complemented by neon cyan (`#00f5d4`), electric magenta (`#f72585`), and arcade gold (`#ffd166`) accents.
- **Dynamic HTML5 Canvas Pixel Scene Engine:** Procedurally renders 8 distinct campus environments with retro pixel art:
  - 🏠 *Aryabhatta Hostel Room 302* (Glowing laptop, bunk beds, steaming chai cup)
  - 🏫 *Prof. Sen's Lecture Hall* (Blackboard with logic equations, wooden desks, clock)
  - 💻 *Turing Computer & Server Lab* (CRT monitors with scrolling matrix code, blinking LED racks)
  - 📖 *Central Campus Library* (Floor-to-ceiling bookshelves, brass reading lamps)
  - ☕ *Campus Canteen* (Checkered retro floors, samosa display, neon sign)
  - 🌳 *Central Lawn & Quad* (Pixel trees, college dome, moving pixel clouds)
  - 👔 *Corporate Interview Boardroom* (Glass skyscraper skyline, interviewer silhouette)
  - 🎆 *Convocation Hall & Stage* (Neon spotlights, banners, floating pixel confetti)
- **Custom Student Avatar Generator:** Customize skin tone, hair color, hoodie palette, engineering branch (CSE, AI, ECE, IT), and starting archetype.
- **Synthesized 8-Bit Sound Effects:** 100% self-contained Web Audio API synthesizer — **no external audio asset downloads required**. Features retro blips, level-up chimes, negative buzzes, perk sparkles, and graduation fanfares.
- **Toggleable CRT Scanline Overlay:** Retro CRT scanline shader effect with one-click toggle in Settings.
- **Fully Responsive:** Adapts cleanly across desktop monitors, laptops, tablets, and smartphones.

---

## 🛠️ Technology Stack
- **HTML5:** Semantic architecture, accessible modals, canvas surfaces, and ARIA attributes.
- **CSS3:** Custom retro design system, chunky pixel borders (`box-shadow` stepping), CSS animations, glowing neon gradients.
- **Vanilla JavaScript (ES6+):** Modular game state machine, canvas renderers, event dispatching, and Web Audio synthesis without external dependencies.
- **LocalStorage API:** Automatic persistence of player profile, stats, chapter progress, perks, and decision history.

---

## 📂 Project Structure
```text
campus_chaos/
├── index.html              # Core semantic game screens and modals
├── style.css               # Retro pixel design tokens, animations, responsive layout
├── script.js               # Web Audio synth, 16-event story tree, 5 endings, canvas renderer
├── test_game_engine.js     # Automated unit & integration test suite validating all 5 endings
└── README.md               # Game documentation, deployment guide, and testing checklist
```

---

## 📖 Chapter & Story Event Breakdown
The simulation spans 4 academic years (16 total interactive events):

### Chapter 1: Freshers' Year
- **Event 1:** Hostel Check-in & Roommate Roulette *(Hostel)*
- **Event 2:** The 8:00 AM Professor Sen Challenge *(Classroom)*
- **Event 3:** Club Recruitment Carnival *(Campus Lawn)*
- **Event 4:** The Freshers' Hackathon 24-Hour Sprint *(Lab)*

### Chapter 2: The Grind
- **Event 5:** Mid-Term Exam Nightmare *(Library)*
- **Event 6:** The Dreaded 68% Attendance Notice *(Classroom)*
- **Event 7:** Open Source Contributor vs Club Head Election *(Canteen)*
- **Event 8:** The Buggy Semester Project Demo *(Lab)*

### Chapter 3: Internship Season
- **Event 9:** The Brutal Resume Roast by Alumni *(Canteen)*
- **Event 10:** The 36-Hour Coding OA (Online Assessment) *(Hostel)*
- **Event 11:** The Clash: Crucial Lab Assignment vs Startup Interview *(Library)*
- **Event 12:** Summer Internship Presentation & PPO Opportunity *(Interview Hall)*

### Chapter 4: Placement Wars
- **Event 13:** Placement Season Day-1: Mega Aptitude & Coding Round *(Lab)*
- **Event 14:** The Technical Interview: "Design a Distributed URL Shortener" *(Interview Hall)*
- **Event 15:** The HR & Leadership Round: "Why Should We Hire You?" *(Interview Hall)*
- **Event 16:** The Final Crossroads: Convocation & The Offer Letter *(Tech Fest Stage)*

---

## 🏆 The 5 Distinct Endings & Exact Rules
Unlike games with random outcomes, every ending in **Campus Chaos** is governed by deterministic rules:

| Ending Title | Badge | Latin Honors | Winning Condition |
| :--- | :---: | :--- | :--- |
| **The Dream Offer** | 🏆 | *Summa Cum Laude* | Chose corporate job offer in Event 16 (`A`), achieved **Career Readiness ≥ 60**, **Skills ≥ 60**, and maintained healthy final **Energy ≥ 25**. |
| **The Academic Star** | 🎓 | *Institute Gold Medalist* | Chose higher studies in Event 16 (`C`), or achieved exceptional theoretical **Academics ≥ 85**. |
| **The Tech Entrepreneur** | 🚀 | *Venture Innovator* | Chose to launch startup in Event 16 (`B`), or holds the `startup_founder` perk. |
| **The Master Connector** | 🤝 | *Alumni Ambassador* | Chose placement track in Event 16 (`A`), achieved **Relationships ≥ 75**, and social network exceeds raw coding skills (`Relationships > Skills`). |
| **The Resilient Survivor (The Comeback)** | 🛡️ | *Grit & Resilience Citation* | Experienced severe energy burnout or finished with standard stats; rallied to overcome setbacks and graduate with tenacity. |

---

## 🚀 How to Run the Game Locally

### Option 1: Direct Double-Click (No Installation Needed!)
Because Campus Chaos is built with pure standard web technologies, you can open it directly:
1. Navigate to the `campus_chaos` folder on your computer.
2. Double-click `index.html` to open it in Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari.

### Option 2: Using Python (Recommended)
If you have Python installed:
```bash
# Navigate to the project directory
cd campus_chaos

# Launch a local server
python -m http.server 8080
```
Open your browser and navigate to: **`http://localhost:8080`**

### Option 3: Using Node.js / npx
```bash
# Run using npx serve
npx -y serve .
```

### Option 4: Using VS Code Live Server
1. Open the `campus_chaos` folder in VS Code.
2. Right-click `index.html` and click **"Open with Live Server"**.

---

## 🌐 How to Deploy to GitHub Pages (Free & Instant)
You can host Campus Chaos online for free on your portfolio in 2 minutes:

1. Create a new repository on [GitHub](https://github.com) named `campus-chaos`.
2. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial release of Campus Chaos: College Life Simulator"
   git branch -M main
   git remote add origin https://github.com/<your-username>/campus-chaos.git
   git push -u origin main
   ```
3. In your GitHub repository:
   - Click **Settings** (⚙️).
   - In the left sidebar, click **Pages**.
   - Under **Build and deployment > Branch**, select `main` and `/ (root)`.
   - Click **Save**.
4. In about 60 seconds, your game will be live at:
   `https://<your-username>.github.io/campus-chaos/`

---

## ⌨️ Game Controls & Shortcuts
- **Mouse / Touch:** Click or tap any button or choice card.
- **Number Keys (`1`, `2`, `3`):** Select Choice A, Choice B, or Choice C directly during events.
- **`Enter` or `Space`:** Advance from the Consequence modal to the next event.
- **`M` Key:** Instantly toggle retro 8-bit sound effects ON/OFF.
- **`Escape` Key:** Open/close the Settings & Pause menu.

---

## 🧪 Developer Testing & Verification Checklist
The game includes an automated test script (`test_game_engine.js`) that verifies all game scenarios:

```bash
# Run the test suite
node test_game_engine.js
```

### Verification Checklist:
- [x] **Main Menu:** Animated campus skyline canvas, New Game, Continue, How to Play.
- [x] **Character Setup:** Student name input, skin/hair/hoodie color picker, branch chips, starting trait modifiers.
- [x] **Live Dashboard:** 5 animated progress bars, numerical counters, chapter timeline, perk counter.
- [x] **Pixel Art Canvas:** Dynamically updates backgrounds across all 8 campus locations with animated student avatar.
- [x] **Choice Consequence Modal:** Real-time stat change delta badges (`+15 Skills`, `-10 Energy`), floating text particles, perk unlock banners.
- [x] **Save System:** Progress auto-saves to browser `localStorage` after each choice; Continue button restores saved run seamlessly.
- [x] **All 5 Endings:** Tested and verified through automated headless simulation for 100% deterministic rule compliance.
- [x] **Graduation Certificate & Share:** Generates Degree Certificate and 1-click clipboard summary report.

---

## 📜 License & Credits
Developed as an open-source indie simulation project. Inspired by real engineering college experiences, late-night coding hackathons, hostel bonding, and campus placement drives.
Feel free to fork, expand with new chapters, or showcase in student portfolios!
