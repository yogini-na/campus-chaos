/**
 * CAMPUS CHAOS — College Life Simulator
 * Core Game Engine, Story System, Pixel Art Canvas Renderer, and Web Audio SFX
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. GLOBAL CONSTANTS & STORAGE KEYS
     ========================================================================== */
  const SAVE_KEY = 'campus_chaos_save_v1';
  const SETTINGS_KEY = 'campus_chaos_settings_v1';

  /* ==========================================================================
     2. RETRO WEB AUDIO 8-BIT SYNTHESIZER
     ========================================================================== */
  class RetroAudioEngine {
    constructor() {
      this.ctx = null;
      this.enabled = true;
      this.volume = 0.7;
    }

    init() {
      if (!this.ctx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    setVolume(val) {
      this.volume = Math.max(0, Math.min(1, val));
    }

    toggleMute() {
      this.enabled = !this.enabled;
      return this.enabled;
    }

    playTone(freq, type = 'square', duration = 0.1, delay = 0, gainLevel = 0.2) {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const startTime = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      const actualGain = gainLevel * this.volume;
      gain.gain.setValueAtTime(actualGain, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    }

    playClick() {
      this.playTone(600, 'square', 0.05, 0, 0.15);
    }

    playStatUp() {
      if (!this.enabled) return;
      this.playTone(440, 'triangle', 0.08, 0, 0.2);     // A4
      this.playTone(554.37, 'triangle', 0.08, 0.07, 0.2); // C#5
      this.playTone(659.25, 'triangle', 0.14, 0.14, 0.25); // E5
    }

    playStatDown() {
      if (!this.enabled) return;
      this.playTone(240, 'sawtooth', 0.09, 0, 0.2);
      this.playTone(180, 'sawtooth', 0.16, 0.08, 0.25);
    }

    playPerkUnlock() {
      if (!this.enabled) return;
      this.playTone(523.25, 'sine', 0.06, 0, 0.2);   // C5
      this.playTone(659.25, 'sine', 0.06, 0.06, 0.2); // E5
      this.playTone(783.99, 'sine', 0.06, 0.12, 0.2); // G5
      this.playTone(1046.5, 'triangle', 0.25, 0.18, 0.3); // C6
    }

    playChapterComplete() {
      if (!this.enabled) return;
      const notes = [392, 523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        this.playTone(freq, 'triangle', 0.12, idx * 0.09, 0.25);
      });
    }

    playEndingFanfare() {
      if (!this.enabled) return;
      const notes = [440, 554, 659, 880, 784, 880, 1108];
      notes.forEach((freq, idx) => {
        this.playTone(freq, 'square', 0.18, idx * 0.12, 0.2);
      });
    }
  }

  const sfx = new RetroAudioEngine();

  /* ==========================================================================
     3. GAME STORY & EVENT DATABASE (16 DETAILED INTERACTIVE EVENTS)
     ========================================================================== */
  const CHAPTERS = [
    { id: 1, name: "Freshers' Year", subtitle: "Surviving the orientation, making friends, and finding your footing." },
    { id: 2, name: "The Grind", subtitle: "Midterms, 36-hour hackathons, attendance panic, and coding projects." },
    { id: 3, name: "Internship Season", subtitle: "Resume roasts, coding rounds, referrals, and high-stakes interviews." },
    { id: 4, name: "Placement Wars", subtitle: "The grand finale: Day-1 companies, HR grilling, and career defining offers." }
  ];

  const STORY_EVENTS = [
    // ------------------------------------------------------------------------
    // CHAPTER 1: FRESHERS' YEAR (Events 0-3)
    // ------------------------------------------------------------------------
    {
      id: "ch1_e1",
      chapter: 1,
      week: 1,
      title: "Hostel Check-in & Roommate Roulette",
      location: "hostel",
      category: "FRESHERS' WEEK",
      description: "You unpack your bags in room 302 of Aryabhatta Hostel. The ceiling fan is squeaking a morse code, and your roommate Raghav is already unpacking a mechanical keyboard and a stash of instant noodles. Outside in the corridor, a group of seniors is rounding up freshers for an icebreaker party.",
      choices: [
        {
          key: "A",
          title: "Join the hostel corridor icebreaker party",
          desc: "Bond with seniors, listen to insider campus lore, and split pizzas till 2:00 AM.",
          preview: { up: ["Relationships +14", "Career +5"], down: ["Energy -12"] },
          deltas: { relationships: 14, career: 5, energy: -12, academics: 0, skills: 0 },
          feedback: {
            title: "Hostel Wing Legend!",
            narrative: "You bonded with everyone in the hostel wing! A 3rd-year senior named Varun promised to share his coveted previous-year question bank and DSA roadmap.",
            perk: { id: "hostel_rep", title: "Hostel Lore Master", desc: "Always knows campus gossip and senior connections." }
          }
        },
        {
          key: "B",
          title: "Setup your battle station and write 'Hello World'",
          desc: "Configure Linux/VS Code, explore modern web tooling, and jumpstart your coding habits.",
          preview: { up: ["Skills +15", "Energy -5"], down: ["Relationships -5"] },
          deltas: { skills: 15, energy: -5, relationships: -5, academics: 0, career: 4 },
          feedback: {
            title: "Terminal Wizard in the Making",
            narrative: "You set up a slick developer environment, committed your first Git repo, and solved 3 introductory problems before falling asleep.",
            perk: { id: "dotfiles_wizard", title: "Dotfiles Connoisseur", desc: "Never starts coding without optimal keybindings." }
          }
        },
        {
          key: "C",
          title: "Unpack calmly and sleep early for tomorrow's 8 AM",
          desc: "Rest your mind, avoid fresher exhaustion, and prepare for syllabus orientation.",
          preview: { up: ["Energy +20", "Academics +6"], down: [] },
          deltas: { energy: 20, academics: 6, skills: 0, relationships: 0, career: 0 },
          feedback: {
            title: "Well-Rested Strategist",
            narrative: "While everyone else woke up with heavy eye bags, you woke up refreshed at 7:00 AM, ready to conquer day one without feeling dizzy.",
            perk: null
          }
        }
      ]
    },
    {
      id: "ch1_e2",
      chapter: 1,
      week: 2,
      title: "The 8:00 AM Professor Sen Challenge",
      location: "classroom",
      category: "ACADEMICS",
      description: "It is 7:55 AM on a rainy Monday. Professor Sen is notorious for locking the lecture hall door at 8:00:00 AM sharp for Digital Electronics. You're half-awake in your hostel bed. Raghav says: 'Bro, he takes manual attendance and marks zeroes for absentees!'",
      choices: [
        {
          key: "A",
          title: "Sprint through the rain to make it to the front row",
          desc: "Slide into class at 7:59 AM, soaked but punctual, and take rigorous lecture notes.",
          preview: { up: ["Academics +15"], down: ["Energy -10"] },
          deltas: { academics: 15, energy: -10, skills: 0, relationships: 2, career: 0 },
          feedback: {
            title: "Front-Row Survivor",
            narrative: "Professor Sen noticed your soaked hoodie and gave a rare approving nod. You absorbed Karnaugh maps and logic gates like a sponge.",
            perk: { id: "punctual_cadet", title: "Punctuality Honor", desc: "Professors recognize your face in internal grading." }
          }
        },
        {
          key: "B",
          title: "Convince your friend to mark a proxy while you self-study DSA",
          desc: "Stay under the warm blanket with your laptop, practicing array algorithms.",
          preview: { up: ["Skills +14"], down: ["Academics -6", "Relationships -4"] },
          deltas: { skills: 14, academics: -6, relationships: -4, energy: 4, career: 2 },
          feedback: {
            title: "Calculated Proxy Risk",
            narrative: "Your friend nervously coughed 'Present Sir!' for you. You nailed binary search problems, but Sen stared suspiciously at the headcount.",
            perk: null
          }
        },
        {
          key: "C",
          title: "Sleep in peacefully and attend the post-lunch lab session",
          desc: "Prioritize your mental well-being and recharge your drained battery.",
          preview: { up: ["Energy +16"], down: ["Academics -10"] },
          deltas: { energy: 16, academics: -10, skills: 0, relationships: 0, career: 0 },
          feedback: {
            title: "Hibernation Mode",
            narrative: "You enjoyed an uninterrupted 9 hours of sleep. However, your attendance portal flashed an ominous yellow warning badge.",
            perk: null
          }
        }
      ]
    },
    {
      id: "ch1_e3",
      chapter: 1,
      week: 3,
      title: "Club Recruitment Carnival",
      location: "campus_lawn",
      category: "CAMPUS CULTURE",
      description: "The central campus lawn is electric! Stalls are decorated with neon fairy lights: the Coding & Open-Source Club (BinaryBeasts), the Robotics & AI Society, and the Grand Cultural / Event Management Fest Committee are all pitching to freshers.",
      choices: [
        {
          key: "A",
          title: "Join BinaryBeasts: Competitive Coding & Open Source",
          desc: "Commit to weekly GitHub sprints, algorithmic contests, and peer code reviews.",
          preview: { up: ["Skills +16", "Career +8"], down: ["Energy -8"] },
          deltas: { skills: 16, career: 8, energy: -8, academics: 0, relationships: 6 },
          feedback: {
            title: "BinaryBeast Inducted!",
            narrative: "You aced their technical entry challenge! You now have direct access to private club repositories, senior mentorship, and hackathon teams.",
            perk: { id: "dev_club", title: "BinaryBeast Core Member", desc: "Access to elite coding resources and team hackathons." }
          }
        },
        {
          key: "B",
          title: "Join the Cultural Fest Committee & Student Council",
          desc: "Manage stage sponsorships, negotiate with brands, and expand your network across departments.",
          preview: { up: ["Relationships +18", "Career +6"], down: ["Academics -6"] },
          deltas: { relationships: 18, career: 6, academics: -6, energy: -6, skills: 0 },
          feedback: {
            title: "Campus Politico & Networker",
            narrative: "You proved your event management skills. Your contact list doubled, and people now greet you across every cafeteria table.",
            perk: { id: "fest_organizer", title: "Campus Connector", desc: "High rapport across campus branches and faculty heads." }
          }
        },
        {
          key: "C",
          title: "Decline all clubs to focus purely on 9+ CGPA",
          desc: "Politely pass the flyers and head to the library to study Engineering Mathematics.",
          preview: { up: ["Academics +16", "Energy +4"], down: ["Relationships -6"] },
          deltas: { academics: 16, energy: 4, relationships: -6, skills: 0, career: 0 },
          feedback: {
            title: "Solo Academic Machine",
            narrative: "No club drama for you. You aced your first Calculus test with flying colors while club members were busy printing event banners.",
            perk: null
          }
        }
      ]
    },
    {
      id: "ch1_e4",
      chapter: 1,
      week: 4,
      title: "The Freshers' Hackathon 24-Hour Sprint",
      location: "lab",
      category: "MILESTONE EVENT",
      description: "It is the annual ByteHacks for first-year students. Red Bull cans litter the lab tables, the projector screen shows a ticking countdown timer: '06:45:00 REMAINING'. Your team has a killer idea for a campus food sharing app, but the authentication API keeps throwing 500 errors.",
      choices: [
        {
          key: "A",
          title: "Chug an espresso, dig into backend logs, and fix the API",
          desc: "Lock in for 5 grueling hours of debugging and deliver a working MVP for the judges.",
          preview: { up: ["Skills +18", "Career +12"], down: ["Energy -18"] },
          deltas: { skills: 18, career: 12, energy: -18, academics: 0, relationships: 8 },
          feedback: {
            title: "Hackathon Silver Medalist! 🥈",
            narrative: "You fixed the JWT token bug at 4:30 AM! The judges loved your live demonstration, awarding your team 2nd place and a cash prize.",
            perk: { id: "hackathon_medal", title: "Hackathon Silver", desc: "Proves real-world building and problem solving grit." }
          }
        },
        {
          key: "B",
          title: "Pivot to an interactive demo mockup with great UI/pitch",
          desc: "Save your energy, design high-fidelity screens, and deliver a charismatic presentation.",
          preview: { up: ["Career +10", "Relationships +10"], down: ["Energy -6"] },
          deltas: { career: 10, relationships: 10, energy: -6, skills: 6, academics: 0 },
          feedback: {
            title: "Best Product Pitch Award! 🎙️",
            narrative: "The judges praised your user empathy and presentation clarity. You didn't win best code, but you won the Audience Favorite trophy!",
            perk: null
          }
        },
        {
          key: "C",
          title: "Step out early with team to sleep before semester exams",
          desc: "Acknowledge the team's effort, submit the repository as-is, and recover sleep.",
          preview: { up: ["Energy +16"], down: ["Career -4"] },
          deltas: { energy: 16, career: -4, skills: 4, academics: 4, relationships: 2 },
          feedback: {
            title: "Pragmatic Rest",
            narrative: "You didn't podium, but you got 8 hours of sleep and avoided the post-hackathon flu that knocked out half the campus.",
            perk: null
          }
        }
      ]
    },

    // ------------------------------------------------------------------------
    // CHAPTER 2: THE GRIND (Events 4-7)
    // ------------------------------------------------------------------------
    {
      id: "ch2_e1",
      chapter: 2,
      week: 5,
      title: "Mid-Term Exam Nightmare",
      location: "library",
      category: "EXAMS & GPA",
      description: "Sophomore year kicks into high gear. Data Structures, Computer Architecture, and Discrete Mathematics midterms are lined up across three consecutive days. The campus library is packed, with students camping out on beanbags.",
      choices: [
        {
          key: "A",
          title: "Form a late-night study syndicate with your toppers group",
          desc: "Divide and conquer syllabus units, solve past question papers, and quiz each other.",
          preview: { up: ["Academics +16", "Relationships +8"], down: ["Energy -10"] },
          deltas: { academics: 16, relationships: 8, energy: -10, skills: 2, career: 0 },
          feedback: {
            title: "Study Circle Synergy",
            narrative: "Your group cracked the exact question types that appeared in the exam! You all scored above the 90th percentile.",
            perk: { id: "topper_circle", title: "Syndicate Member", desc: "Collaborative study buffs improve exam resilience." }
          }
        },
        {
          key: "B",
          title: "Cram only the high-weightage topics and keep building your side project",
          desc: "Secure passing grades while learning Docker and building an AI portfolio project.",
          preview: { up: ["Skills +16", "Career +8"], down: ["Academics -4", "Energy -6"] },
          deltas: { skills: 16, career: 8, academics: -4, energy: -6, relationships: 0 },
          feedback: {
            title: "Practical Hacker Strategy",
            narrative: "You scored a respectable B+ on the exams while successfully deploying your side project to production on the cloud!",
            perk: null
          }
        },
        {
          key: "C",
          title: "Rely on last-minute 2-hour YouTube crash courses",
          desc: "Trust the legendary YouTube professors and conserve your energy.",
          preview: { up: ["Energy +12"], down: ["Academics -6"] },
          deltas: { energy: 12, academics: -6, skills: 0, relationships: 4, career: 0 },
          feedback: {
            title: "YouTube Savior",
            narrative: "The 15-minute animation on B-Trees saved you from failing, but you barely crossed the passing threshold.",
            perk: null
          }
        }
      ]
    },
    {
      id: "ch2_e2",
      chapter: 2,
      week: 6,
      title: "The Dreaded 68% Attendance Notice",
      location: "classroom",
      category: "CAMPUS DILEMMA",
      description: "A red notification flashes on your college ERP portal: 'ATTENDANCE SHORTAGE WARNING: 68.2%'. The minimum requirement for appearing in end-semester exams is 75%. Head of Department (HOD) Dr. Rao has scheduled a disciplinary hearing.",
      choices: [
        {
          key: "A",
          title: "Submit a genuine medical certificate and attend every single makeup class",
          desc: "Pledge 100% attendance for the remaining month and sit through 4-hour lab marathons.",
          preview: { up: ["Academics +15"], down: ["Energy -14", "Skills -4"] },
          deltas: { academics: 15, energy: -14, skills: -4, relationships: 2, career: 0 },
          feedback: {
            title: "Attendance Restored to 76.5%!",
            narrative: "Dr. Rao accepted your makeup lab journals with a stern warning. You are officially cleared to write exams!",
            perk: { id: "attendance_clearance", title: "Iron Attendance", desc: "Survived the dreaded 75% rule unscathed." }
          }
        },
        {
          key: "B",
          title: "Represent the college at an inter-college tech fest for an on-duty waiver",
          desc: "Win an official participation OD form signed by the Dean of Student Affairs.",
          preview: { up: ["Career +14", "Skills +10"], down: ["Energy -8"] },
          deltas: { career: 14, skills: 10, energy: -8, academics: 5, relationships: 6 },
          feedback: {
            title: "Official On-Duty Legend!",
            narrative: "You represented the college, won 1st prize in the coding relay, and the Dean automatically credited your attendance with full on-duty marks!",
            perk: { id: "od_master", title: "Dean's Representative", desc: "Master of official extracurricular on-duty waivers." }
          }
        },
        {
          key: "C",
          title: "Beg the lab assistant and help configure the departmental PCs",
          desc: "Spend an afternoon fixing ethernet cables and formatting Windows machines.",
          preview: { up: ["Academics +10", "Relationships +8"], down: ["Energy -6"] },
          deltas: { academics: 10, relationships: 8, energy: -6, skills: 2, career: 0 },
          feedback: {
            title: "Lab Assistant's Favorite",
            narrative: "Lab technician Ramesh bro appreciated your computer troubleshooting help and silently bumped your attendance register to 75.1%!",
            perk: null
          }
        }
      ]
    },
    {
      id: "ch2_e3",
      chapter: 2,
      week: 7,
      title: "Open Source Contributor vs Club Head Election",
      location: "canteen",
      category: "CAREER CHOICES",
      description: "Over samosas and filter coffee in the college canteen, you face a major crossroad. The campus tech community wants you to run for President of the Developers Club, but an open-source issue in a popular GitHub library (50k+ stars) you’ve been eyeing was just assigned to you.",
      choices: [
        {
          key: "A",
          title: "Focus on the GitHub pull request & build your international profile",
          desc: "Deep-dive into Rust/TypeScript internals, write unit tests, and get merged by core maintainers.",
          preview: { up: ["Skills +18", "Career +14"], down: ["Relationships -6", "Energy -8"] },
          deltas: { skills: 18, career: 14, relationships: -6, energy: -8, academics: 0 },
          feedback: {
            title: "PR Merged & Global Shoutout! 🚀",
            narrative: "The maintainers merged your pull request and gave you a public shoutout on Twitter! Silicon Valley recruiters started viewing your GitHub profile.",
            perk: { id: "oss_contributor", title: "Open Source Contributor", desc: "High credibility on GitHub and technical resumes." }
          }
        },
        {
          key: "B",
          title: "Campaign for Club President & lead a 200-member community",
          desc: "Deliver an inspiring speech, organize campus workshops, and gain management leadership.",
          preview: { up: ["Relationships +18", "Career +10"], down: ["Skills -4", "Academics -4"] },
          deltas: { relationships: 18, career: 10, skills: -4, academics: -4, energy: -8 },
          feedback: {
            title: "Elected Club President! 👑",
            narrative: "You won by a landslide! You are now presiding over college workshops, hosting guest speakers, and building invaluable leadership chops.",
            perk: { id: "club_president", title: "Club President", desc: "Proven leadership, public speaking, and team management." }
          }
        },
        {
          key: "C",
          title: "Politely step back from both and protect your personal sanity",
          desc: "Take weekends off, go on bike rides with hostel friends, and read fiction.",
          preview: { up: ["Energy +22", "Relationships +8"], down: ["Career -6"] },
          deltas: { energy: 22, relationships: 8, career: -6, skills: 0, academics: 2 },
          feedback: {
            title: "Healthy Work-Life Harmony",
            narrative: "Your mental health bounced back to pristine levels. You avoided the sophomore burnout that trapped your peers.",
            perk: null
          }
        }
      ]
    },
    {
      id: "ch2_e4",
      chapter: 2,
      week: 8,
      title: "The Buggy Semester Project Demo",
      location: "lab",
      category: "MID-JOURNEY CLIMAX",
      description: "It is the final demo day for Database Management Systems. External evaluators are circulating. Just 10 minutes before your turn, a merge conflict causes a fatal null pointer exception on the main dashboard screen!",
      choices: [
        {
          key: "A",
          title: "Live-debug the stack trace on the command line in 8 minutes",
          desc: "Keep cool, pinpoint the missing SQL foreign key constraint, and rebuild the container.",
          preview: { up: ["Skills +16", "Academics +12"], down: ["Energy -12"] },
          deltas: { skills: 16, academics: 12, energy: -12, relationships: 4, career: 4 },
          feedback: {
            title: "Clutch Live Debugging!",
            narrative: "Your hands flew across the keyboard. You fixed the query just as the professor walked up. The demo ran flawlessly and earned an 'A' grade!",
            perk: { id: "calm_under_pressure", title: "Ice in the Veins", desc: "Never panics during live demos or technical interrogations." }
          }
        },
        {
          key: "B",
          title: "Distract the evaluator with a brilliant architectural whiteboard pitch",
          desc: "Draw complex system design diagrams on the board while Raghav resets the database.",
          preview: { up: ["Career +12", "Relationships +10"], down: ["Skills -2"] },
          deltas: { career: 12, relationships: 10, skills: -2, academics: 8, energy: -6 },
          feedback: {
            title: "Master of System Design",
            narrative: "The evaluator was so captivated by your distributed caching explanation that they barely inspected the UI bugs!",
            perk: null
          }
        },
        {
          key: "C",
          title: "Honest disclosure: explain the bug and present the unit test coverage",
          desc: "Show engineering maturity by explaining failure modes and how to prevent them in CI/CD.",
          preview: { up: ["Career +10", "Academics +10"], down: ["Energy -4"] },
          deltas: { career: 10, academics: 10, energy: -4, skills: 6, relationships: 2 },
          feedback: {
            title: "Engineering Maturity",
            narrative: "The evaluator smiled: 'Most students hide their bugs. You demonstrated true software engineering practices.' Full marks awarded!",
            perk: null
          }
        }
      ]
    },

    // ------------------------------------------------------------------------
    // CHAPTER 3: INTERNSHIP SEASON (Events 8-11)
    // ------------------------------------------------------------------------
    {
      id: "ch3_e1",
      chapter: 3,
      week: 9,
      title: "The Brutal Resume Roast by Alumni",
      location: "canteen",
      category: "CAREER PREP",
      description: "Junior year arrives, and the summer internship drive is around the corner. A senior alumnus working at Microsoft visits campus and offers to review student resumes over evening chai. He glances at your current single-page draft and raises an eyebrow.",
      choices: [
        {
          key: "A",
          title: "Completely rewrite your resume using the Harvard/FAANG format",
          desc: "Quantify metrics with the STAR framework, link verified live projects, and clean LaTeX typography.",
          preview: { up: ["Career +18", "Skills +6"], down: ["Energy -10"] },
          deltas: { career: 18, skills: 6, energy: -10, academics: 0, relationships: 4 },
          feedback: {
            title: "ATS-Proof Gold Standard Resume! 📄",
            narrative: "The alumnus beamed: 'Now this is an engineer's resume.' Your ATS score jumped to 94%, ensuring instant shortlist status.",
            perk: { id: "ats_resume", title: "Gold Tier Resume", desc: "Shortlist rates at top-tier tech firms multiplied." }
          }
        },
        {
          key: "B",
          title: "Cold-message 50 engineering managers on LinkedIn for referrals",
          desc: "Craft personalized pitches, link your GitHub projects, and request 10-minute informational chats.",
          preview: { up: ["Career +15", "Relationships +14"], down: ["Energy -12"] },
          deltas: { career: 15, relationships: 14, energy: -12, academics: 0, skills: 0 },
          feedback: {
            title: "Referral Engine Fired Up!",
            narrative: "Three alumni at fintech unicorns replied and referred you directly to their hiring managers, bypassing the initial resume screen!",
            perk: { id: "linkedin_guru", title: "Referral Machine", desc: "Never applies through the front door without an insider referral." }
          }
        },
        {
          key: "C",
          title: "Trust your current draft and spend the weekend solving LeetCode hards",
          desc: "Focus on graphs, dynamic programming, and segment trees instead of formatting.",
          preview: { up: ["Skills +16", "Career +6"], down: ["Energy -8"] },
          deltas: { skills: 16, career: 6, energy: -8, relationships: 0, academics: 0 },
          feedback: {
            title: "Algorithmic Grinder",
            narrative: "Your resume stayed standard, but your ability to solve complex Graph algorithms became lightning fast.",
            perk: null
          }
        }
      ]
    },
    {
      id: "ch3_e2",
      chapter: 3,
      week: 10,
      title: "The 36-Hour Coding OA (Online Assessment)",
      location: "hostel",
      category: "TECH GAUNTLET",
      description: "An invite from a Tier-1 tech company arrives in your inbox: a 90-minute HackerRank test containing 3 hard algorithmic problems and 10 SQL/Concurrency MCQs. The test link expires at midnight. Your internet connection is slightly unstable due to a campus thunderstorm.",
      choices: [
        {
          key: "A",
          title: "Lock your hostel door, switch to mobile hotspot backup, and lock in",
          desc: "Full mental concentration: optimize time complexity to O(N log N) with custom data structures.",
          preview: { up: ["Skills +18", "Career +16"], down: ["Energy -14"] },
          deltas: { skills: 18, career: 16, energy: -14, academics: 0, relationships: -2 },
          feedback: {
            title: "100% Test Cases Passed! 🎯",
            narrative: "All hidden test cases turned green with 12 minutes to spare! The automated testing bot congratulated you for ranking in the top 3% percentile.",
            perk: { id: "oa_master", title: "OA Demon", desc: "Consistently aces automated algorithmic screening rounds." }
          }
        },
        {
          key: "B",
          title: "Gather a 3-person room syndicate to brainstorm test cases together",
          desc: "Collaborate silently with high-trust peers on edge cases and optimal constraints.",
          preview: { up: ["Career +14", "Relationships +12"], down: ["Skills +6", "Energy -8"] },
          deltas: { career: 14, relationships: 12, skills: 6, energy: -8, academics: 0 },
          feedback: {
            title: "Syndicate Triumph",
            narrative: "Your team identified nasty boundary conditions in problem 2. You all cleared the cut-off without burning out solo.",
            perk: null
          }
        },
        {
          key: "C",
          title: "Rush through the test quickly to make it to your friend's birthday dinner",
          desc: "Submit your best attempt in 45 minutes and go celebrate with hostel mates.",
          preview: { up: ["Relationships +16", "Energy +6"], down: ["Career -6"] },
          deltas: { relationships: 16, energy: 6, career: -6, skills: 4, academics: 0 },
          feedback: {
            title: "Memories Over Metrics",
            narrative: "You only passed 2 out of 3 questions and missed the shortlist, but the rooftop birthday dinner created memories that will last a lifetime.",
            perk: null
          }
        }
      ]
    },
    {
      id: "ch3_e3",
      chapter: 3,
      week: 11,
      title: "The Clash: Crucial Lab Assignment vs Startup Interview",
      location: "library",
      category: "TOUGH TRADE-OFF",
      description: "An ambitious AI startup offers you a 45-minute technical interview tomorrow morning at 10:00 AM. However, your Operating Systems lab exam is also scheduled for 10:00 AM, and Prof. Sen refuses to reschedule without severe penalty.",
      choices: [
        {
          key: "A",
          title: "Request the startup to reschedule to 6:00 AM or late evening",
          desc: "Demonstrate polite professional communication and handle both commitments on the same day.",
          preview: { up: ["Career +14", "Academics +10"], down: ["Energy -16"] },
          deltas: { career: 14, academics: 10, energy: -16, skills: 4, relationships: 0 },
          feedback: {
            title: "Iron Will Double-Header!",
            narrative: "The startup founder appreciated your hustle and interviewed you at 7:00 AM. You aced it, dashed to the OS lab at 10:00 AM, and completed both successfully!",
            perk: { id: "multitasker", title: "Master Multitasker", desc: "Never drops balls even when deadlines clash." }
          }
        },
        {
          key: "B",
          title: "Skip the OS lab exam entirely and go all-in on the interview",
          desc: "Accept the backlog risk in college to pursue high-growth startup equity and experience.",
          preview: { up: ["Career +18", "Skills +10"], down: ["Academics -18"] },
          deltas: { career: 18, skills: 10, academics: -18, energy: -6, relationships: 0 },
          feedback: {
            title: "High-Stakes Gambler",
            narrative: "The founder offered you the internship on the spot! But your OS grade took an ugly dent that dropped your GPA.",
            perk: null
          }
        },
        {
          key: "C",
          title: "Prioritize the OS lab exam and decline the startup interview",
          desc: "Protect your spotless academic transcript for future campus placements and higher studies.",
          preview: { up: ["Academics +16", "Energy +4"], down: ["Career -8"] },
          deltas: { academics: 16, energy: 4, career: -8, skills: 0, relationships: 0 },
          feedback: {
            title: "Academic Devotion",
            narrative: "You scored top marks in the OS lab. The startup hired someone else, but your CGPA remains untarnished.",
            perk: null
          }
        }
      ]
    },
    {
      id: "ch3_e4",
      chapter: 3,
      week: 12,
      title: "Summer Internship Presentation & Pre-Placement Offer (PPO)",
      location: "interview_hall",
      category: "MILESTONE EVENT",
      description: "It is the final week of your summer internship. The engineering director and VP of Product are sitting in the boardroom. You must present the microservice architecture you built over the past 8 weeks.",
      choices: [
        {
          key: "A",
          title: "Present a polished deck featuring performance benchmarks & latency gains",
          desc: "Highlight how your Redis caching reduced p99 query latency by 42% across millions of calls.",
          preview: { up: ["Career +20", "Skills +12"], down: ["Energy -8"] },
          deltas: { career: 20, skills: 12, energy: -8, academics: 0, relationships: 6 },
          feedback: {
            title: "Pre-Placement Offer (PPO) Secured! 📜",
            narrative: "The VP stood up and applauded. Before you even walked out of the conference room, HR handed you an official Pre-Placement Offer for senior year!",
            perk: { id: "ppo_holder", title: "PPO in Pocket", desc: "Has an existing full-time offer before senior year begins." }
          }
        },
        {
          key: "B",
          title: "Emphasize team collaboration, documentation, and handover guides",
          desc: "Position yourself as a reliable, empathetic engineer who uplifts the whole team.",
          preview: { up: ["Relationships +16", "Career +14"], down: ["Energy -4"] },
          deltas: { relationships: 16, career: 14, energy: -4, skills: 4, academics: 0 },
          feedback: {
            title: "Beloved Team Player",
            narrative: "Your manager wrote an exceptional recommendation letter and promised to expedite your return offer paperwork.",
            perk: null
          }
        },
        {
          key: "C",
          title: "Deliver an adequate presentation and take time to recharge back home",
          desc: "Wrap up the deliverables smoothly without burning midnight oil on final week decks.",
          preview: { up: ["Energy +18"], down: ["Career -2"] },
          deltas: { energy: 18, career: -2, skills: 4, relationships: 4, academics: 0 },
          feedback: {
            title: "Relaxed Conclusion",
            narrative: "You completed your internship peacefully, collected your completion certificate and stipend, and rested up for the senior year onslaught.",
            perk: null
          }
        }
      ]
    },

    // ------------------------------------------------------------------------
    // CHAPTER 4: PLACEMENT WARS (Events 12-15)
    // ------------------------------------------------------------------------
    {
      id: "ch4_e1",
      chapter: 4,
      week: 13,
      title: "Placement Season Day-1: The Mega Aptitude & Coding Round",
      location: "lab",
      category: "PLACEMENT WARS",
      description: "Final year has arrived. The campus auditorium is filled with 800 final-year students in formal suits. Day-1 marquee companies (Amazon, Microsoft, Google, Goldman Sachs) have opened their registration portals simultaneously.",
      choices: [
        {
          key: "A",
          title: "Focus all preparation on Tier-1 Product Companies",
          desc: "Solve hard DP/Tree problems and practice low-level system design patterns.",
          preview: { up: ["Skills +16", "Career +16"], down: ["Energy -12"] },
          deltas: { skills: 16, career: 16, energy: -12, academics: 0, relationships: -2 },
          feedback: {
            title: "Super-Dream Shortlist Cleared!",
            narrative: "Your name appeared in bold on the notice board for 3 Tier-1 Product Company shortlists! The crowd in the placement office gasps.",
            perk: { id: "day1_shortlist", title: "Day-1 Shortlisted", desc: "Shortlisted by marquee Tier-1 dream recruiters." }
          }
        },
        {
          key: "B",
          title: "Strategically split between fintech firms and consulting giants",
          desc: "Combine coding prowess with quantitative aptitude, market sizing, and logic puzzles.",
          preview: { up: ["Career +15", "Relationships +10"], down: ["Energy -8"] },
          deltas: { career: 15, relationships: 10, energy: -8, skills: 6, academics: 0 },
          feedback: {
            title: "Diversified Portfolio",
            narrative: "You cleared shortlists across both Quant/Fintech and Consulting tracks. Multiple doors are wide open!",
            perk: null
          }
        },
        {
          key: "C",
          title: "Help your anxious batchmates rehearse and review their resumes",
          desc: "Organize mock interview sessions in the hostel common room to calm everyone's nerves.",
          preview: { up: ["Relationships +18", "Energy +6"], down: ["Skills -4"] },
          deltas: { relationships: 18, energy: 6, skills: -4, career: 6, academics: 0 },
          feedback: {
            title: "The Batch Anchor",
            narrative: "Your calm leadership helped 6 of your closest friends clear their aptitude rounds. The entire wing is rooting for you!",
            perk: { id: "batch_hero", title: "Batch Anchor", desc: "Deeply respected by the entire graduating class." }
          }
        }
      ]
    },
    {
      id: "ch4_e2",
      chapter: 4,
      week: 14,
      title: "The Technical Interview: 'Design a Distributed URL Shortener'",
      location: "interview_hall",
      category: "TECHNICAL GAUNTLET",
      description: "You sit across from the Lead Architect of a top tech firm. He slides a marker toward you and points to the whiteboard: 'Design Bitly. We have 100 million daily active users, 500:1 read-to-write ratio, and sub-10ms latency. Go.'",
      choices: [
        {
          key: "A",
          title: "Systematically tackle requirements, capacity estimation, hashing & database sharding",
          desc: "Walk through functional/non-functional specs, MurmurHash, Redis clusters, and Master-Slave replication.",
          preview: { up: ["Skills +18", "Career +18"], down: ["Energy -10"] },
          deltas: { skills: 18, career: 18, energy: -10, academics: 0, relationships: 2 },
          feedback: {
            title: "System Design Mastery! 🏗️",
            narrative: "The architect leaned back with an ear-to-ear grin: 'Most freshers just draw a single box for database. You thought about read replicas and cache invalidation. Outstanding.'",
            perk: { id: "sys_design_pro", title: "Distributed Architect", desc: "Expert in scalable systems and distributed databases." }
          }
        },
        {
          key: "B",
          title: "Focus heavily on API elegance, error handling & security considerations",
          desc: "Design clean REST/gRPC endpoints, rate limiters, token bucket algorithms, and DDoS protections.",
          preview: { up: ["Career +14", "Skills +12"], down: ["Energy -6"] },
          deltas: { career: 14, skills: 12, energy: -6, academics: 2, relationships: 0 },
          feedback: {
            title: "Clean Code & Security Champion",
            narrative: "The interviewer appreciated your emphasis on rate limiting and security headers. A solid Hire recommendation was logged!",
            perk: null
          }
        },
        {
          key: "C",
          title: "Be honest about gaps, brainstorm cooperatively, and adapt to interviewer hints",
          desc: "Demonstrate high coachability, curiosity, and pleasant communication under stress.",
          preview: { up: ["Relationships +14", "Career +10"], down: ["Energy -4"] },
          deltas: { relationships: 14, career: 10, energy: -4, skills: 6, academics: 0 },
          feedback: {
            title: "High Coachability",
            narrative: "Your collaborative attitude shone through. The interviewer noted: 'Pleasure to problem-solve with; will be a wonderful teammate.'",
            perk: null
          }
        }
      ]
    },
    {
      id: "ch4_e3",
      chapter: 4,
      week: 15,
      title: "The HR & Leadership Round: 'Why Should We Hire You?'",
      location: "interview_hall",
      category: "CULTURE FIT",
      description: "It is 9:30 PM. You’ve been in formal attire for 13 hours straight. You enter the final HR and Leadership interview round. The Senior HR Director looks you in the eye: 'You have impressive scores, but so does everyone here. Tell me about a time you failed miserably and what you learned.'",
      choices: [
        {
          key: "A",
          title: "Share a deeply vulnerable story about academic or project failure and how you bounced back",
          desc: "Demonstrate high self-awareness, emotional intelligence, and relentless resilience.",
          preview: { up: ["Career +16", "Relationships +12"], down: ["Energy -6"] },
          deltas: { career: 16, relationships: 12, energy: -6, skills: 0, academics: 0 },
          feedback: {
            title: "Authentic & Emotionally Intelligent! 💖",
            narrative: "The HR Director paused in silence, deeply moved: 'In a sea of rehearsed answers, yours was authentic and brave.' Full 10/10 culture fit score!",
            perk: { id: "eq_champion", title: "Culture Fit Paragon", desc: "Exceptional storytelling, emotional intelligence, and executive presence." }
          }
        },
        {
          key: "B",
          title: "Connect your engineering work directly to company business values & revenue",
          desc: "Speak the language of customer retention, unit economics, and operational efficiency.",
          preview: { up: ["Career +18", "Skills +6"], down: ["Energy -8"] },
          deltas: { career: 18, skills: 6, energy: -8, relationships: 4, academics: 0 },
          feedback: {
            title: "Business-Savvy Engineer",
            narrative: "HR flagged you as future engineering management material. 'You don't just write code; you understand why software creates value.'",
            perk: null
          }
        },
        {
          key: "C",
          title: "Express genuine passion for mentoring juniors and building inclusive culture",
          desc: "Highlight your community workshops, peer tutoring, and campus leadership.",
          preview: { up: ["Relationships +18", "Career +10"], down: ["Energy -2"] },
          deltas: { relationships: 18, career: 10, energy: -2, academics: 0, skills: 0 },
          feedback: {
            title: "Natural Mentor",
            narrative: "The HR team saw a future culture champion who will elevate team morale and retain top engineering talent.",
            perk: null
          }
        }
      ]
    },
    {
      id: "ch4_e4",
      chapter: 4,
      week: 16,
      title: "The Final Crossroads: Convocation & The Offer Letter",
      location: "tech_fest",
      category: "GRAND FINALE",
      description: "The placement bell rings across the campus at 11:59 PM! The placement cell office doors open to announce the final offers. At the same time, graduate school fellowship emails have landed, and your startup co-founder is tapping your shoulder with a pitch deck in hand.",
      choices: [
        {
          key: "A",
          title: "Accept the High-Impact Tech Career Offer",
          desc: "Sign the agreement for a premier Software Engineering role with massive growth and learning.",
          preview: { up: ["Career +18", "Skills +10"], down: [] },
          deltas: { career: 18, skills: 10, academics: 0, energy: 5, relationships: 5 },
          feedback: {
            title: "Offer Letter Signed! ✍️",
            narrative: "You inked your name on the employment agreement! Your parents cried tears of joy over the phone, and the hostel erupted in celebrations.",
            perk: { id: "dream_contract", title: "Offer Signed", desc: "Stepping directly into high-growth software engineering." }
          }
        },
        {
          key: "B",
          title: "Take the Leap: Launch your AI & Developer Tooling Startup",
          desc: "Reject corporate comfort to build your own venture with your best hostel mates.",
          preview: { up: ["Skills +16", "Relationships +16"], down: ["Career +6", "Energy -10"] },
          deltas: { skills: 16, relationships: 16, career: 6, energy: -10, academics: 0 },
          feedback: {
            title: "Founder Mode Activated! 🚀",
            narrative: "You chose the road less traveled! With a prototype and 500 active beta users, you and your roommates incorporate your new tech company.",
            perk: { id: "startup_founder", title: "Founder Mode", desc: "Turned down comfortable salaries to build something of your own." }
          }
        },
        {
          key: "C",
          title: "Pursue Elite Higher Studies & Research Fellowship",
          desc: "Head towards an advanced Master's/Ph.D. program in Computer Science or Artificial Intelligence.",
          preview: { up: ["Academics +20", "Skills +8"], down: ["Career +4"] },
          deltas: { academics: 20, skills: 8, career: 4, energy: 0, relationships: 4 },
          feedback: {
            title: "Scholar of the Future! 🎓",
            narrative: "Your academic excellence paved the way to a premier research laboratory. You will push the boundaries of computing science!",
            perk: { id: "master_scholar", title: "Research Fellow", desc: "Admitted into prestigious higher studies program." }
          }
        }
      ]
    }
  ];

  /* ==========================================================================
     4. MULTIPLE ENDINGS DEFINITIONS & EVALUATION ENGINE
     ========================================================================== */
  const ENDINGS = [
    {
      id: "entrepreneur",
      title: "THE TECH ENTREPRENEUR",
      badge: "🚀",
      honors: "Venture Innovator",
      condition: (p) => {
        const history = p.history || [];
        const lastChoice = history.find(h => h.eventId === 'ch4_e4');
        return lastChoice ? (lastChoice.choiceKey === 'B') : (p.perks || []).some(x => x.id === 'startup_founder');
      },
      narrative: "Instead of following the predictable corporate conveyor belt, you leveraged your technical chops and strong campus network to co-found a tech venture. Within three months of graduation, your developer tooling product crossed 10,000 GitHub stars and closed its pre-seed funding round led by top angel investors. You are not just building software—you are building a company."
    },
    {
      id: "academic_star",
      title: "THE ACADEMIC STAR",
      badge: "🎓",
      honors: "Institute Gold Medalist",
      condition: (p) => {
        const history = p.history || [];
        const lastChoice = history.find(h => h.eventId === 'ch4_e4');
        return lastChoice ? (lastChoice.choiceKey === 'C') : (p.stats.academics >= 85);
      },
      narrative: "With an astronomical CGPA, deep theoretical mastery, and glowing recommendation letters from senior professors, you earned a fully-funded Master's & Research Fellowship at an elite global institution. You proved that deep academic discipline and fundamental computing rigor unlock doors that fleeting tech fads never could."
    },
    {
      id: "networker",
      title: "THE MASTER CONNECTOR",
      badge: "🤝",
      honors: "Distinguished Alumni Ambassador",
      condition: (p) => {
        const history = p.history || [];
        const lastChoice = history.find(h => h.eventId === 'ch4_e4');
        const choseJob = !lastChoice || lastChoice.choiceKey === 'A';
        return choseJob && p.stats.relationships >= 75 && (p.stats.relationships > p.stats.skills || (p.perks || []).some(x => x.id === 'fest_organizer' || x.id === 'club_president'));
      },
      narrative: "Your superpower was never just writing code—it was connecting humans, rallying teams, and communicating vision. Through alumni connections, student fest leadership, and sheer charisma, you bypassed automated screening gates to land a coveted Technical Product Management & Community Lead role through a direct executive referral."
    },
    {
      id: "dream_offer",
      title: "THE DREAM OFFER",
      badge: "🏆",
      honors: "Summa Cum Laude",
      condition: (p) => {
        const history = p.history || [];
        const lastChoice = history.find(h => h.eventId === 'ch4_e4');
        const choseJob = !lastChoice || lastChoice.choiceKey === 'A';
        return choseJob && p.stats.career >= 60 && p.stats.skills >= 60 && p.stats.energy >= 25;
      },
      narrative: "You walked out of campus with the crown jewel of placements: a Day-1 Tier-1 Unicorn / FAANG Software Engineering offer. Your relentless balance of algorithmic mastery, production-grade projects, and interview presence paid off in full. Your photo is framed on the placement cell wall of fame, and your juniors will study your DSA roadmap for generations to come."
    },
    {
      id: "comeback",
      title: "THE RESILIENT SURVIVOR",
      badge: "🛡️",
      honors: "Grit & Resilience Citation",
      condition: () => true, // Fallback default ending rule
      narrative: "Your college journey was a rollercoaster of attendance scares, brutal exam crunches, sleepless hostel nights, and sudden twists. But when the odds were down, you adapted, learned, and never surrendered. You graduated with a solid core engineering role, lifelong friendships, and an unshakeable resilience that will serve you throughout your career."
    }
  ];

  /* ==========================================================================
     5. GAME STATE MODEL
     ========================================================================== */
  const DEFAULT_STATE = {
    player: {
      name: "Alex Ray",
      branch: "CSE",
      trait: "coder",
      avatar: {
        skin: "#ffdbac",
        hair: "#2c1810",
        hoodie: "#7209b7"
      }
    },
    stats: {
      academics: 50,
      skills: 50,
      energy: 70,
      relationships: 50,
      career: 30
    },
    perks: [],
    history: [],
    hadBurnout: false,
    currentEventIndex: 0,
    currentChapter: 1,
    isCompleted: false,
    finalEnding: null
  };

  let gameState = JSON.parse(JSON.stringify(DEFAULT_STATE));

  /* ==========================================================================
     6. CANVAS RENDERING ENGINES (PIXEL ART)
     ========================================================================== */
  
  // 6A. Menu Animated Canvas (Retro Campus Night Skyline)
  function initMenuCanvas() {
    const canvas = document.getElementById('menu-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let stars = [];

    for (let i = 0; i < 70; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * (canvas.height * 0.65),
        size: Math.random() < 0.8 ? 1 : 2,
        twinkle: Math.random() * 6.28,
        speed: 0.02 + Math.random() * 0.04
      });
    }

    let clockTick = 0;

    function render() {
      if (document.getElementById('screen-menu').classList.contains('screen-hidden')) {
        requestAnimationFrame(render);
        return;
      }

      ctx.fillStyle = '#0a0718';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.7);
      skyGrad.addColorStop(0, '#0a0718');
      skyGrad.addColorStop(0.5, '#170e38');
      skyGrad.addColorStop(1, '#2c1257');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height * 0.7);

      // Retro Big Pixel Moon
      ctx.fillStyle = '#fbf5df';
      ctx.beginPath();
      ctx.arc(520, 80, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e8d9a4';
      ctx.beginPath();
      ctx.arc(514, 76, 6, 0, Math.PI * 2);
      ctx.arc(530, 88, 5, 0, Math.PI * 2);
      ctx.fill();

      // Twinkling Pixel Stars
      stars.forEach(s => {
        s.twinkle += s.speed;
        const alpha = 0.3 + 0.7 * Math.sin(s.twinkle);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fillRect(Math.floor(s.x), Math.floor(s.y), s.size, s.size);
      });

      // Distant Campus Skyline Buildings (Silhouette 1)
      ctx.fillStyle = '#110b27';
      ctx.fillRect(40, 160, 60, 200);
      ctx.fillRect(120, 140, 80, 220);
      ctx.fillRect(220, 170, 70, 190);
      ctx.fillRect(380, 150, 90, 210);
      ctx.fillRect(480, 175, 80, 185);

      // Main College Clock Tower (Center Silhouette 2)
      ctx.fillStyle = '#1c123d';
      ctx.fillRect(290, 100, 70, 260); // Tower body
      ctx.fillRect(280, 90, 90, 12);   // Tower roof ledge
      // Tower pointed roof
      ctx.beginPath();
      ctx.moveTo(280, 90);
      ctx.lineTo(325, 45);
      ctx.lineTo(370, 90);
      ctx.fill();

      // Tower Clock Face
      clockTick += 0.03;
      ctx.fillStyle = '#ffd166';
      ctx.beginPath();
      ctx.arc(325, 125, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1c123d';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(325, 125);
      ctx.lineTo(325 + 7 * Math.cos(clockTick), 125 + 7 * Math.sin(clockTick));
      ctx.stroke();

      // Glowing Campus Windows (Pixel matrix)
      for (let bx = 50; bx < 600; bx += 30) {
        for (let by = 180; by < 320; by += 24) {
          if ((bx + by) % 5 === 0) {
            ctx.fillStyle = ((bx * 7 + by) % 3 === 0) ? '#00f5d4' : '#ffd166';
            ctx.fillRect(bx, by, 8, 12);
          }
        }
      }

      // Ground / Campus Lawns Foreground
      ctx.fillStyle = '#080512';
      ctx.fillRect(0, 310, canvas.width, 50);

      // Street Lamp Posts
      [80, 230, 430, 570].forEach(lx => {
        ctx.fillStyle = '#3a2e63';
        ctx.fillRect(lx, 260, 4, 50);
        ctx.fillStyle = '#ffd166';
        ctx.fillRect(lx - 3, 255, 10, 6);
        // Light cone
        ctx.fillStyle = 'rgba(255, 209, 102, 0.08)';
        ctx.beginPath();
        ctx.moveTo(lx + 2, 261);
        ctx.lineTo(lx - 25, 310);
        ctx.lineTo(lx + 29, 310);
        ctx.fill();
      });

      requestAnimationFrame(render);
    }

    render();
  }

  // 6B. Avatar Sprite Drawer (Draws a charming 16-bit student sprite)
  function drawStudentSprite(ctx, cx, cy, scale, avatarConfig, isBouncing = false) {
    const skin = avatarConfig.skin || '#ffdbac';
    const hair = avatarConfig.hair || '#2c1810';
    const hoodie = avatarConfig.hoodie || '#7209b7';

    ctx.save();
    ctx.translate(cx, cy);

    const bounce = isBouncing ? (Math.sin(Date.now() / 240) * 2 * scale) : 0;

    // Head / Face
    ctx.fillStyle = skin;
    ctx.fillRect(-6 * scale, (-16 * scale) + bounce, 12 * scale, 10 * scale);

    // Hair Top & Fringe
    ctx.fillStyle = hair;
    ctx.fillRect(-7 * scale, (-20 * scale) + bounce, 14 * scale, 6 * scale);
    ctx.fillRect(-7 * scale, (-16 * scale) + bounce, 3 * scale, 4 * scale);
    ctx.fillRect(4 * scale, (-16 * scale) + bounce, 3 * scale, 4 * scale);

    // Eyes
    ctx.fillStyle = '#0e0b16';
    ctx.fillRect(-4 * scale, (-13 * scale) + bounce, 2 * scale, 3 * scale);
    ctx.fillRect(2 * scale, (-13 * scale) + bounce, 2 * scale, 3 * scale);
    // Eye sparkle
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-4 * scale, (-13 * scale) + bounce, 1 * scale, 1 * scale);
    ctx.fillRect(2 * scale, (-13 * scale) + bounce, 1 * scale, 1 * scale);

    // Smile
    ctx.fillStyle = '#b05d4b';
    ctx.fillRect(-2 * scale, (-9 * scale) + bounce, 4 * scale, 1 * scale);

    // Hoodie / Body
    ctx.fillStyle = hoodie;
    ctx.fillRect(-8 * scale, (-6 * scale) + bounce, 16 * scale, 13 * scale);

    // Hoodie drawstrings
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-3 * scale, (-4 * scale) + bounce, 1 * scale, 5 * scale);
    ctx.fillRect(2 * scale, (-4 * scale) + bounce, 1 * scale, 5 * scale);

    // Hands
    ctx.fillStyle = skin;
    ctx.fillRect(-10 * scale, (-1 * scale) + bounce, 3 * scale, 4 * scale);
    ctx.fillRect(7 * scale, (-1 * scale) + bounce, 3 * scale, 4 * scale);

    // Jeans / Pants
    ctx.fillStyle = '#1e3d59';
    ctx.fillRect(-6 * scale, (7 * scale) + bounce, 5 * scale, 9 * scale);
    ctx.fillRect(1 * scale, (7 * scale) + bounce, 5 * scale, 9 * scale);

    // Sneakers
    ctx.fillStyle = '#e8eaed';
    ctx.fillRect(-7 * scale, (15 * scale) + bounce, 6 * scale, 3 * scale);
    ctx.fillRect(1 * scale, (15 * scale) + bounce, 6 * scale, 3 * scale);
    ctx.fillStyle = '#d90429';
    ctx.fillRect(-7 * scale, (17 * scale) + bounce, 6 * scale, 1 * scale);
    ctx.fillRect(1 * scale, (17 * scale) + bounce, 6 * scale, 1 * scale);

    ctx.restore();
  }

  // 6C. Scene Illustration Renderer (Draws locations: hostel, classroom, lab, library, canteen, campus_lawn, interview_hall, tech_fest)
  let sceneAnimationId = null;

  function renderSceneCanvas(locationId) {
    const canvas = document.getElementById('scene-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    if (sceneAnimationId) {
      cancelAnimationFrame(sceneAnimationId);
    }

    function drawFrame() {
      ctx.clearRect(0, 0, w, h);

      switch (locationId) {
        case 'hostel':
          drawHostelScene(ctx, w, h);
          break;
        case 'classroom':
          drawClassroomScene(ctx, w, h);
          break;
        case 'lab':
          drawLabScene(ctx, w, h);
          break;
        case 'library':
          drawLibraryScene(ctx, w, h);
          break;
        case 'canteen':
          drawCanteenScene(ctx, w, h);
          break;
        case 'campus_lawn':
          drawCampusLawnScene(ctx, w, h);
          break;
        case 'interview_hall':
          drawInterviewScene(ctx, w, h);
          break;
        case 'tech_fest':
          drawTechFestScene(ctx, w, h);
          break;
        default:
          drawCampusLawnScene(ctx, w, h);
          break;
      }

      // Draw Player Sprite inside the scene
      drawStudentSprite(ctx, w * 0.72, h * 0.68, 3.2, gameState.player.avatar, true);

      sceneAnimationId = requestAnimationFrame(drawFrame);
    }

    drawFrame();
  }

  // Helper Drawing Functions for Locations
  function drawHostelScene(ctx, w, h) {
    // Room Walls & Floor
    ctx.fillStyle = '#1b143a';
    ctx.fillRect(0, 0, w, h * 0.75);
    ctx.fillStyle = '#2c1e4a';
    ctx.fillRect(0, h * 0.75, w, h * 0.25);

    // Floor baseboard
    ctx.fillStyle = '#0f0a21';
    ctx.fillRect(0, h * 0.75 - 6, w, 6);

    // Window showing night sky & moon
    ctx.fillStyle = '#090514';
    ctx.fillRect(40, 30, 130, 100);
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(80, 60, 12, 0, Math.PI * 2);
    ctx.fill();
    // Window frame
    ctx.strokeStyle = '#432c66';
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 30, 130, 100);
    ctx.beginPath();
    ctx.moveTo(105, 30); ctx.lineTo(105, 130);
    ctx.moveTo(40, 80); ctx.lineTo(170, 80);
    ctx.stroke();

    // Wall Poster (Retro 8-bit Matrix/Code)
    ctx.fillStyle = '#0a2318';
    ctx.fillRect(220, 35, 75, 95);
    ctx.strokeStyle = '#06d6a0';
    ctx.lineWidth = 2;
    ctx.strokeRect(220, 35, 75, 95);
    ctx.fillStyle = '#00f5d4';
    ctx.font = '7px monospace';
    ctx.fillText('KEEP CALM', 232, 60);
    ctx.fillText('& CODE', 238, 75);

    // Study Desk
    ctx.fillStyle = '#5c3a21';
    ctx.fillRect(160, 160, 240, 70);
    ctx.fillStyle = '#3e2411';
    ctx.fillRect(170, 230, 14, 40);
    ctx.fillRect(380, 230, 14, 40);

    // Glowing Laptop on desk
    ctx.fillStyle = '#2b2d42';
    ctx.fillRect(240, 140, 50, 30);
    ctx.fillStyle = '#00f5d4';
    ctx.fillRect(243, 143, 44, 24); // Screen glow
    ctx.fillStyle = '#111';
    ctx.font = '6px monospace';
    ctx.fillText('> git push', 246, 156);
    ctx.fillStyle = '#4a4e69';
    ctx.fillRect(235, 170, 60, 6); // Keyboard base

    // Steaming Chai / Coffee Cup
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(330, 155, 12, 14);
    const steamY = 150 + Math.sin(Date.now() / 200) * 3;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(333, steamY, 3, 5);
    ctx.fillRect(337, steamY - 4, 3, 4);

    // Hostel Bunk Bed (Left)
    ctx.fillStyle = '#22193e';
    ctx.fillRect(20, 140, 110, 100);
    ctx.fillStyle = '#f72585';
    ctx.fillRect(25, 175, 100, 20); // Blanket
    ctx.fillStyle = '#fff';
    ctx.fillRect(30, 165, 25, 12); // Pillow
  }

  function drawClassroomScene(ctx, w, h) {
    // Walls & Floor
    ctx.fillStyle = '#232938';
    ctx.fillRect(0, 0, w, h * 0.72);
    ctx.fillStyle = '#3c4155';
    ctx.fillRect(0, h * 0.72, w, h * 0.28);

    // Huge Classroom Blackboard
    ctx.fillStyle = '#10392b';
    ctx.fillRect(60, 25, 360, 120);
    ctx.strokeStyle = '#7c5328';
    ctx.lineWidth = 6;
    ctx.strokeRect(60, 25, 360, 120);

    // Chalk writings on board
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = '10px "VT323", monospace';
    ctx.fillText('CS204: DIGITAL ELECTRONICS & ALGORITHMS', 80, 50);
    ctx.fillText('Q = (A AND B) OR (NOT C)', 80, 75);
    ctx.fillText('T(N) = 2T(N/2) + O(N) -> O(N log N)', 80, 98);
    ctx.fillText('* ATTENDANCE IS MANDATORY (75% RULE)', 80, 122);

    // Professor Lectern / Podium (Left)
    ctx.fillStyle = '#533418';
    ctx.fillRect(70, 150, 45, 60);

    // Wooden Student Benches
    ctx.fillStyle = '#6b4423';
    ctx.fillRect(170, 180, 230, 16);
    ctx.fillRect(180, 196, 10, 40);
    ctx.fillRect(380, 196, 10, 40);

    // Wall Clock
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(460, 45, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Clock hands (pointing to 8:00 AM)
    ctx.beginPath();
    ctx.moveTo(460, 45); ctx.lineTo(460, 34);
    ctx.moveTo(460, 45); ctx.lineTo(460, 45);
    ctx.stroke();
  }

  function drawLabScene(ctx, w, h) {
    // High-tech Server & Computer Lab
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, w, h * 0.74);
    ctx.fillStyle = '#161b22';
    ctx.fillRect(0, h * 0.74, w, h * 0.26);

    // Server Rack (Left) with blinking status LEDs
    ctx.fillStyle = '#21262d';
    ctx.fillRect(30, 30, 60, 180);
    ctx.strokeStyle = '#30363d';
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, 60, 180);

    const now = Date.now();
    for (let sy = 45; sy < 200; sy += 18) {
      ctx.fillStyle = '#484f58';
      ctx.fillRect(36, sy, 48, 8);
      // Blinking LEDs
      ctx.fillStyle = (Math.sin(now / 150 + sy) > 0) ? '#00f5d4' : '#06d6a0';
      ctx.fillRect(74, sy + 2, 4, 4);
      ctx.fillStyle = (Math.cos(now / 200 + sy) > 0) ? '#ffd166' : '#f72585';
      ctx.fillRect(66, sy + 2, 4, 4);
    }

    // Long Computer Workbenches
    ctx.fillStyle = '#30363d';
    ctx.fillRect(120, 165, 330, 20);
    ctx.fillRect(130, 185, 12, 50);
    ctx.fillRect(430, 185, 12, 50);

    // Rows of Glowing CRT/LCD Monitors
    [140, 220, 300, 370].forEach((mx, idx) => {
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(mx, 120, 50, 40);
      ctx.strokeStyle = '#484f58';
      ctx.strokeRect(mx, 120, 50, 40);
      // Monitor stand
      ctx.fillStyle = '#21262d';
      ctx.fillRect(mx + 20, 160, 10, 6);

      // Terminal Screen Green Matrix Code
      ctx.fillStyle = (idx === 1) ? '#f72585' : '#00f5d4';
      ctx.font = '5px monospace';
      ctx.fillText('010110', mx + 6, 132);
      ctx.fillText('STATUS:OK', mx + 6, 142);
      ctx.fillText('NODE_ENV', mx + 6, 152);
    });

    // Ethernet Cables hanging
    ctx.strokeStyle = '#4361ee';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(90, 80);
    ctx.quadraticCurveTo(110, 140, 140, 165);
    ctx.stroke();
  }

  function drawLibraryScene(ctx, w, h) {
    // Warm Wood & Rich Quiet Study Ambience
    ctx.fillStyle = '#1f132b';
    ctx.fillRect(0, 0, w, h * 0.75);
    ctx.fillStyle = '#3a2312';
    ctx.fillRect(0, h * 0.75, w, h * 0.25);

    // Tall Bookshelves Packed with Colorful Books
    ctx.fillStyle = '#4a2c14';
    ctx.fillRect(30, 20, 130, 170);
    ctx.fillRect(180, 20, 130, 170);

    const bookColors = ['#f72585', '#7209b7', '#00f5d4', '#ffd166', '#06d6a0', '#4361ee', '#e63946'];
    for (let shelfY = 30; shelfY < 180; shelfY += 36) {
      // Shelf divider
      ctx.fillStyle = '#2e190a';
      ctx.fillRect(30, shelfY + 28, 280, 5);

      // Books spines
      for (let bx = 34; bx < 300; bx += 8) {
        if (bx > 155 && bx < 185) continue; // gap between shelves
        ctx.fillStyle = bookColors[(bx * 3 + shelfY) % bookColors.length];
        const bHeight = 18 + ((bx * 7) % 8);
        ctx.fillRect(bx, shelfY + 28 - bHeight, 6, bHeight);
      }
    }

    // Study Desk & Banker's Brass Lamp
    ctx.fillStyle = '#653b1b';
    ctx.fillRect(330, 160, 140, 25);
    ctx.fillRect(340, 185, 10, 45);
    ctx.fillRect(450, 185, 10, 45);

    // Green Banker's Reading Lamp
    ctx.fillStyle = '#06d6a0';
    ctx.fillRect(350, 135, 24, 10);
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(360, 145, 4, 15);
    // Warm ambient glow
    ctx.fillStyle = 'rgba(255, 209, 102, 0.15)';
    ctx.beginPath();
    ctx.arc(362, 145, 30, 0, Math.PI * 2);
    ctx.fill();

    // Open Book with text lines
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(390, 154, 30, 10);
    ctx.fillStyle = '#222';
    ctx.fillRect(394, 156, 10, 1);
    ctx.fillRect(394, 159, 10, 1);
    ctx.fillRect(406, 156, 10, 1);
  }

  function drawCanteenScene(ctx, w, h) {
    // Cheerful Retro College Canteen
    ctx.fillStyle = '#281a3d';
    ctx.fillRect(0, 0, w, h * 0.72);

    // Checkered Retro Floor
    for (let fx = 0; fx < w; fx += 24) {
      for (let fy = Math.floor(h * 0.72); fy < h; fy += 16) {
        ctx.fillStyle = ((fx / 24 + fy / 16) % 2 === 0) ? '#4a154b' : '#f7f7f9';
        ctx.fillRect(fx, fy, 24, 16);
      }
    }

    // Glowing Neon CANTEEN Sign
    ctx.fillStyle = '#100b21';
    ctx.fillRect(80, 20, 180, 40);
    ctx.strokeStyle = '#f72585';
    ctx.lineWidth = 3;
    ctx.strokeRect(80, 20, 180, 40);
    ctx.fillStyle = '#00f5d4';
    ctx.font = '16px "VT323", monospace';
    ctx.fillText('★ CAMPUS CHAI & BITES ★', 95, 46);

    // Food Counter / Snack Stall
    ctx.fillStyle = '#7209b7';
    ctx.fillRect(60, 140, 280, 60);
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(60, 135, 280, 8);

    // Samosa & Patty Display Case
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(90, 95, 120, 40);
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(90, 95, 120, 40);

    // Samosas
    for (let sx = 100; sx < 200; sx += 22) {
      ctx.fillStyle = '#f77f00';
      ctx.beginPath();
      ctx.moveTo(sx + 8, 110);
      ctx.lineTo(sx, 130);
      ctx.lineTo(sx + 16, 130);
      ctx.fill();
    }

    // Soda Vending Machine (Right)
    ctx.fillStyle = '#e63946';
    ctx.fillRect(360, 50, 65, 145);
    ctx.fillStyle = '#1d3557';
    ctx.fillRect(370, 70, 45, 60);
    ctx.fillStyle = '#ffd166';
    ctx.font = '8px monospace';
    ctx.fillText('SODA', 380, 100);
  }

  function drawCampusLawnScene(ctx, w, h) {
    // Blue Day Sky & Pixel Clouds
    ctx.fillStyle = '#48cae4';
    ctx.fillRect(0, 0, w, h * 0.68);

    // Pixel Sun
    ctx.fillStyle = '#ffe600';
    ctx.fillRect(60, 25, 26, 26);

    // Moving Pixel Clouds
    const cloudOffset = (Date.now() / 80) % (w + 100);
    ctx.fillStyle = '#ffffff';
    [100, 320, 540].forEach((cx) => {
      const actualX = (cx - cloudOffset + w + 100) % (w + 100) - 50;
      ctx.fillRect(actualX, 35, 60, 16);
      ctx.fillRect(actualX + 12, 25, 36, 10);
    });

    // College Main Administrative Building (Horizon)
    ctx.fillStyle = '#8338ec';
    ctx.fillRect(140, 90, 220, 80);
    ctx.fillStyle = '#3a0ca3';
    ctx.fillRect(220, 50, 60, 120); // Central Dome
    // Dome roof
    ctx.beginPath();
    ctx.arc(250, 50, 30, Math.PI, 0);
    ctx.fill();

    // Lush Green Lawn
    ctx.fillStyle = '#2a9d8f';
    ctx.fillRect(0, h * 0.68, w, h * 0.32);
    ctx.fillStyle = '#264653';
    ctx.fillRect(0, h * 0.68 - 4, w, 4);

    // Pixel Trees
    [40, 100, 400, 480].forEach(tx => {
      ctx.fillStyle = '#582f0e';
      ctx.fillRect(tx + 12, 130, 10, 45);
      ctx.fillStyle = '#52b788';
      ctx.beginPath();
      ctx.arc(tx + 17, 125, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#74c69d';
      ctx.beginPath();
      ctx.arc(tx + 17, 115, 18, 0, Math.PI * 2);
      ctx.fill();
    });

    // Stone Pathway
    ctx.fillStyle = '#e9ecef';
    ctx.beginPath();
    ctx.moveTo(250, h * 0.68);
    ctx.lineTo(290, h * 0.68);
    ctx.lineTo(360, h);
    ctx.lineTo(180, h);
    ctx.fill();
  }

  function drawInterviewScene(ctx, w, h) {
    // Sleek Corporate Boardroom / Glass Office
    ctx.fillStyle = '#121624';
    ctx.fillRect(0, 0, w, h * 0.74);
    ctx.fillStyle = '#22283d';
    ctx.fillRect(0, h * 0.74, w, h * 0.26);

    // City Skyscraper Skyline through Glass Windows
    ctx.fillStyle = '#0a0d17';
    ctx.fillRect(40, 20, 380, 130);
    for (let bbx = 60; bbx < 400; bbx += 35) {
      ctx.fillStyle = '#1c2237';
      const bh = 50 + (bbx % 7) * 9;
      ctx.fillRect(bbx, 150 - bh, 28, bh);
      // Window dots
      ctx.fillStyle = '#ffd166';
      ctx.fillRect(bbx + 6, 150 - bh + 10, 4, 6);
      ctx.fillRect(bbx + 16, 150 - bh + 24, 4, 6);
    }
    // Window Mullions (Frames)
    ctx.strokeStyle = '#384260';
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 20, 380, 130);
    ctx.beginPath();
    ctx.moveTo(160, 20); ctx.lineTo(160, 150);
    ctx.moveTo(280, 20); ctx.lineTo(280, 150);
    ctx.stroke();

    // Corporate Conference Table
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(100, 160, 280, 30);
    ctx.fillStyle = '#1a202c';
    ctx.fillRect(120, 190, 16, 40);
    ctx.fillRect(340, 190, 16, 40);

    // Interviewer Silhouette (Left)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(170, 140, 16, 0, Math.PI * 2); // Head
    ctx.fill();
    ctx.fillRect(150, 156, 40, 35); // Suit body
    // Tie
    ctx.fillStyle = '#e63946';
    ctx.fillRect(168, 158, 4, 18);

    // Interviewer's Open Laptop with Company Logo
    ctx.fillStyle = '#718096';
    ctx.fillRect(200, 150, 32, 20);
    ctx.fillStyle = '#00f5d4';
    ctx.beginPath();
    ctx.arc(216, 160, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawTechFestScene(ctx, w, h) {
    // Grand Auditorium Stage with Neon Spotlights & Confetti
    ctx.fillStyle = '#090414';
    ctx.fillRect(0, 0, w, h);

    // Neon Spotlight Beams
    const now = Date.now();
    const beamAngle1 = Math.sin(now / 400) * 0.3;
    const beamAngle2 = Math.cos(now / 350) * 0.3;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 245, 212, 0.18)';
    ctx.beginPath();
    ctx.moveTo(80, 0);
    ctx.lineTo(w * 0.4 + beamAngle1 * 120, h);
    ctx.lineTo(w * 0.55 + beamAngle1 * 120, h);
    ctx.fill();

    ctx.fillStyle = 'rgba(247, 37, 133, 0.18)';
    ctx.beginPath();
    ctx.moveTo(w - 80, 0);
    ctx.lineTo(w * 0.3 + beamAngle2 * 120, h);
    ctx.lineTo(w * 0.45 + beamAngle2 * 120, h);
    ctx.fill();
    ctx.restore();

    // Stage Platform
    ctx.fillStyle = '#1e113a';
    ctx.fillRect(40, 180, w - 80, 60);
    ctx.fillStyle = '#7209b7';
    ctx.fillRect(40, 175, w - 80, 8);

    // Neon Campus Banner
    ctx.fillStyle = '#0e0821';
    ctx.fillRect(120, 20, 280, 45);
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 3;
    ctx.strokeRect(120, 20, 280, 45);
    ctx.fillStyle = '#ffd166';
    ctx.font = '16px "VT323", monospace';
    ctx.fillText('🎓 CONVOCATION & TECH GALA 2026 🎓', 135, 48);

    // Floating Festive Pixel Confetti
    const confettiColors = ['#00f5d4', '#f72585', '#ffd166', '#06d6a0', '#fff'];
    for (let i = 0; i < 40; i++) {
      const cx = (i * 19 + (now / 30)) % w;
      const cy = (i * 31 + (now / 20)) % (h * 0.8);
      ctx.fillStyle = confettiColors[i % confettiColors.length];
      ctx.fillRect(cx, cy, 3, 3);
    }
  }

  // 6D. Avatar Preview Drawer for Setup Screen
  function updateAvatarPreview() {
    const canvas = document.getElementById('avatar-preview-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background tile
    ctx.fillStyle = '#0f0a21';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw sprite
    drawStudentSprite(ctx, canvas.width / 2, canvas.height * 0.58, 3.8, gameState.player.avatar, true);
  }

  // 6E. HUD Avatar Mini Drawer
  function updateHudAvatar() {
    const canvas = document.getElementById('hud-avatar-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#0d0a21';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawStudentSprite(ctx, canvas.width / 2, canvas.height * 0.72, 1.8, gameState.player.avatar, false);
  }

  /* ==========================================================================
     7. GAME LOGIC & STAT SYSTEM
     ========================================================================== */

  function clampStat(val) {
    return Math.max(0, Math.min(100, Math.round(val)));
  }

  function applyStatDeltas(deltas) {
    const changes = [];
    const prevStats = { ...gameState.stats };

    for (const [statKey, delta] of Object.entries(deltas)) {
      if (delta !== 0 && gameState.stats.hasOwnProperty(statKey)) {
        gameState.stats[statKey] = clampStat(gameState.stats[statKey] + delta);
        changes.push({
          stat: statKey,
          delta: delta,
          newVal: gameState.stats[statKey]
        });

        // Spawn floating delta particle
        spawnFloatingDelta(statKey, delta);
      }
    }

    // Play appropriate SFX based on net change
    const net = Object.values(deltas).reduce((a, b) => a + b, 0);
    if (net >= 0) {
      sfx.playStatUp();
    } else {
      sfx.playStatDown();
    }

    // Check if player experiences low energy burnout
    if (gameState.stats.energy <= 25) {
      gameState.hadBurnout = true;
    }

    updateStatsDashboard();
    return changes;
  }

  function spawnFloatingDelta(statKey, delta) {
    const container = document.getElementById('stat-particles-anchor');
    if (!container) return;

    const el = document.createElement('div');
    const isPositive = delta > 0;
    el.className = `floating-delta ${isPositive ? 'positive' : 'negative'}`;
    el.textContent = `${isPositive ? '+' : ''}${delta} ${statKey.toUpperCase()}`;

    // Randomize slight horizontal position
    const randX = 30 + Math.random() * 40;
    const randY = 40 + Math.random() * 30;
    el.style.left = `${randX}%`;
    el.style.top = `${randY}%`;

    container.appendChild(el);
    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 1600);
  }

  function updateStatsDashboard() {
    const stats = gameState.stats;

    // Numerical values
    document.getElementById('val-academics').textContent = stats.academics;
    document.getElementById('val-skills').textContent = stats.skills;
    document.getElementById('val-energy').textContent = stats.energy;
    document.getElementById('val-relationships').textContent = stats.relationships;
    document.getElementById('val-career').textContent = stats.career;

    // Progress bar fills
    document.getElementById('bar-academics').style.width = `${stats.academics}%`;
    document.getElementById('bar-skills').style.width = `${stats.skills}%`;
    document.getElementById('bar-energy').style.width = `${stats.energy}%`;
    document.getElementById('bar-relationships').style.width = `${stats.relationships}%`;
    document.getElementById('bar-career').style.width = `${stats.career}%`;

    // Low Energy Alarm check
    const energyBar = document.getElementById('bar-energy');
    if (stats.energy < 20) {
      energyBar.classList.add('low-energy');
    } else {
      energyBar.classList.remove('low-energy');
    }

    // Timeline HUD
    const currentEv = STORY_EVENTS[gameState.currentEventIndex] || STORY_EVENTS[STORY_EVENTS.length - 1];
    document.getElementById('hud-chapter-text').textContent = `CHAPTER ${currentEv.chapter}: ${CHAPTERS[currentEv.chapter - 1].name.toUpperCase()}`;
    document.getElementById('hud-week-text').textContent = `WEEK ${currentEv.week} / 16`;
    const progressPercent = ((gameState.currentEventIndex + 1) / STORY_EVENTS.length) * 100;
    document.getElementById('hud-progress-fill').style.width = `${Math.min(100, progressPercent)}%`;

    // Perks counter
    document.getElementById('hud-perk-count').textContent = gameState.perks.length;
  }

  /* ==========================================================================
     8. SCREEN NAVIGATION & MODAL CONTROLLERS
     ========================================================================== */

  function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(scr => {
      scr.classList.remove('screen-active');
      scr.classList.add('screen-hidden');
    });

    const target = document.getElementById(screenId);
    if (target) {
      target.classList.remove('screen-hidden');
      target.classList.add('screen-active');
    }
  }

  function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('modal-hidden');
    }
  }

  function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('modal-hidden');
    }
  }

  function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 3000);
  }

  /* ==========================================================================
     9. EVENT FLOW & DECISION HANDLING
     ========================================================================== */

  function loadCurrentEvent() {
    if (gameState.currentEventIndex >= STORY_EVENTS.length) {
      triggerEndingSequence();
      return;
    }

    const ev = STORY_EVENTS[gameState.currentEventIndex];

    // Check if entering a new chapter (milestone summary)
    if (ev.chapter > gameState.currentChapter) {
      triggerChapterSummary(gameState.currentChapter);
      gameState.currentChapter = ev.chapter;
      saveGame();
      return;
    }

    // Update Location badge & Scene Canvas
    document.getElementById('scene-location-name').textContent = formatLocationName(ev.location);
    document.getElementById('narrative-category-tag').textContent = ev.category;
    document.getElementById('narrative-event-title').textContent = ev.title;
    document.getElementById('narrative-text').textContent = ev.description;

    renderSceneCanvas(ev.location);
    renderChoiceCards(ev.choices);
    updateStatsDashboard();
    saveGame();
  }

  function formatLocationName(loc) {
    const map = {
      hostel: "Aryabhatta Hostel — Room 302",
      classroom: "Lecture Hall Complex — Prof. Sen's Hall",
      lab: "Turing Computer Lab & Server Room",
      library: "Central Campus Library — Quiet Wing",
      canteen: "Campus Canteen & Samosa Stall",
      campus_lawn: "Central Lawn & Student Plaza",
      interview_hall: "Placement Cell & Corporate Suite",
      tech_fest: "Main Auditorium — Convocation Hall"
    };
    return map[loc] || "Campus Grounds";
  }

  function renderChoiceCards(choices) {
    const container = document.getElementById('choices-container');
    container.innerHTML = '';

    choices.forEach((choice, index) => {
      const card = document.createElement('div');
      card.className = 'choice-card';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');

      let previewTagsHtml = '';
      if (choice.preview.up) {
        choice.preview.up.forEach(p => {
          previewTagsHtml += `<span class="preview-tag up">▲ ${p}</span>`;
        });
      }
      if (choice.preview.down) {
        choice.preview.down.forEach(p => {
          previewTagsHtml += `<span class="preview-tag down">▼ ${p}</span>`;
        });
      }

      card.innerHTML = `
        <div class="choice-header">
          <span class="choice-key">[KEY ${choice.key}]</span>
          <span class="choice-title">${choice.title}</span>
          <div class="choice-preview-tags">${previewTagsHtml}</div>
        </div>
        <div class="choice-desc">${choice.desc}</div>
      `;

      card.addEventListener('click', () => {
        handleChoiceSelection(choice);
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleChoiceSelection(choice);
        }
      });

      container.appendChild(card);
    });
  }

  function handleChoiceSelection(choice) {
    sfx.playClick();

    // Record decision in history
    const currentEv = STORY_EVENTS[gameState.currentEventIndex];
    gameState.history.push({
      eventId: currentEv.id,
      eventTitle: currentEv.title,
      choiceKey: choice.key,
      choiceTitle: choice.title,
      deltas: choice.deltas
    });

    // Apply stat changes
    const changes = applyStatDeltas(choice.deltas);

    // Check for perk unlock
    let perkUnlocked = null;
    if (choice.feedback.perk) {
      const exists = gameState.perks.some(p => p.id === choice.feedback.perk.id);
      if (!exists) {
        gameState.perks.push(choice.feedback.perk);
        perkUnlocked = choice.feedback.perk;
        sfx.playPerkUnlock();
      }
    }

    // Show Consequence Modal
    displayFeedbackModal(choice, changes, perkUnlocked);
  }

  function displayFeedbackModal(choice, changes, perk) {
    document.getElementById('feedback-choice-tag').textContent = `SELECTED: CHOICE ${choice.key}`;
    document.getElementById('feedback-title').textContent = choice.feedback.title;
    document.getElementById('feedback-narrative').textContent = choice.feedback.narrative;

    // Stat changes delta grid
    const deltasGrid = document.getElementById('feedback-deltas-grid');
    deltasGrid.innerHTML = '';

    changes.forEach(c => {
      const pill = document.createElement('div');
      const isGain = c.delta > 0;
      pill.className = `delta-pill ${isGain ? 'gain' : 'loss'}`;
      pill.textContent = `${isGain ? '▲ +' : '▼ '}${c.delta} ${c.stat.toUpperCase()}`;
      deltasGrid.appendChild(pill);
    });

    // Perk unlock banner
    const perkBanner = document.getElementById('feedback-perk-unlock');
    if (perk) {
      document.getElementById('feedback-perk-text').textContent = `Unlocked Perk: "${perk.title}" (${perk.desc})`;
      perkBanner.classList.remove('hidden');
    } else {
      perkBanner.classList.add('hidden');
    }

    showModal('modal-feedback');

    // Auto-focus next button for accessibility
    setTimeout(() => {
      document.getElementById('btn-feedback-next').focus();
    }, 100);
  }

  function advanceToNextEvent() {
    hideModal('modal-feedback');
    gameState.currentEventIndex++;
    saveGame();
    loadCurrentEvent();
  }

  /* ==========================================================================
     10. CHAPTER SUMMARY & INTERMISSION
     ========================================================================== */

  function triggerChapterSummary(completedChapterNum) {
    sfx.playChapterComplete();
    const chapter = CHAPTERS[completedChapterNum - 1];

    document.getElementById('chapter-summary-title').textContent = `CHAPTER ${completedChapterNum} COMPLETED!`;
    document.getElementById('chapter-summary-subtitle').textContent = chapter.subtitle;

    // Calculate Estimated SGPA based on Academics
    const gpa = (6.0 + (gameState.stats.academics / 100) * 4.0).toFixed(2);
    document.getElementById('summary-sgpa').textContent = `${gpa} / 10`;

    // Dynamic evaluation narrative
    let evalText = "";
    if (gameState.stats.academics >= 75) {
      evalText += "Your professors are singing your praises. Academic standing is pristine. ";
    } else if (gameState.stats.academics <= 40) {
      evalText += "Attendance and midterms were shaky. You survived detention by a hair's breadth. ";
    } else {
      evalText += "You maintained a solid, respectable academic balance. ";
    }

    if (gameState.stats.skills >= 70) {
      evalText += "Technically, your GitHub profile is glowing like a Christmas tree!";
    } else if (gameState.stats.relationships >= 70) {
      evalText += "Socially, you are the most recognized fresher on your hostel floor!";
    }
    document.getElementById('summary-eval-desc').textContent = evalText;

    // Render Stats list
    const breakdown = document.getElementById('summary-stats-breakdown');
    breakdown.innerHTML = `
      <div class="summary-stat-row">
        <span class="summary-stat-name">📚 Academics</span>
        <span class="summary-stat-val" style="color:var(--stat-academics);">${gameState.stats.academics}/100</span>
      </div>
      <div class="summary-stat-row">
        <span class="summary-stat-name">💻 Coding Skills</span>
        <span class="summary-stat-val" style="color:var(--stat-skills);">${gameState.stats.skills}/100</span>
      </div>
      <div class="summary-stat-row">
        <span class="summary-stat-name">⚡ Energy & Health</span>
        <span class="summary-stat-val" style="color:var(--stat-energy);">${gameState.stats.energy}/100</span>
      </div>
      <div class="summary-stat-row">
        <span class="summary-stat-name">🤝 Relationships</span>
        <span class="summary-stat-val" style="color:var(--stat-relationships);">${gameState.stats.relationships}/100</span>
      </div>
      <div class="summary-stat-row">
        <span class="summary-stat-name">💼 Career Readiness</span>
        <span class="summary-stat-val" style="color:var(--stat-career);">${gameState.stats.career}/100</span>
      </div>
    `;

    switchScreen('screen-chapter-summary');
  }

  /* ==========================================================================
     11. MULTIPLE ENDINGS & GRADUATION CEREMONY
     ========================================================================== */

  function triggerEndingSequence() {
    sfx.playEndingFanfare();
    gameState.isCompleted = true;

    // Evaluate Ending Rule
    let achievedEnding = ENDINGS.find(e => e.condition(gameState));
    if (!achievedEnding) achievedEnding = ENDINGS[ENDINGS.length - 1]; // Fallback Comeback ending
    gameState.finalEnding = achievedEnding.id;

    // Render Ending Screen
    document.getElementById('ending-title').textContent = achievedEnding.title;
    document.getElementById('ending-badge-icon').textContent = achievedEnding.badge;
    document.getElementById('ending-narrative-text').textContent = achievedEnding.narrative;

    // Certificate details
    document.getElementById('cert-student-name').textContent = gameState.player.name;
    document.getElementById('cert-branch').textContent = formatBranchName(gameState.player.branch);
    document.getElementById('cert-honors').textContent = achievedEnding.honors;

    // Final Transcript Bars
    const statsBars = document.getElementById('final-stats-bars');
    statsBars.innerHTML = '';

    const statLabels = [
      { key: 'academics', label: 'Academics', icon: '📚' },
      { key: 'skills', label: 'Coding Skills', icon: '💻' },
      { key: 'energy', label: 'Energy & Health', icon: '⚡' },
      { key: 'relationships', label: 'Relationships', icon: '🤝' },
      { key: 'career', label: 'Career Ready', icon: '💼' }
    ];

    statLabels.forEach(s => {
      const val = gameState.stats[s.key];
      const grade = getLetterGrade(val);
      const div = document.createElement('div');
      div.className = 'final-stat-item';
      div.innerHTML = `
        <div class="final-stat-label-row">
          <span>${s.icon} ${s.label}: <strong>${val}/100</strong></span>
          <span class="final-stat-grade">GRADE: ${grade}</span>
        </div>
        <div class="stat-bar-track">
          <div class="stat-bar-fill fill-${s.key}" style="width: ${val}%;"></div>
        </div>
      `;
      statsBars.appendChild(div);
    });

    // Unlocked Achievements & Perks
    const achievementsList = document.getElementById('final-achievements-list');
    achievementsList.innerHTML = '';
    if (gameState.perks.length === 0) {
      achievementsList.innerHTML = '<li class="achievement-item">⭐ Completed 4 Years of Engineering Chaos</li>';
    } else {
      gameState.perks.forEach(p => {
        const li = document.createElement('li');
        li.className = 'achievement-item';
        li.innerHTML = `✨ <strong>${p.title}</strong> — ${p.desc}`;
        achievementsList.appendChild(li);
      });
    }

    saveGame();
    switchScreen('screen-ending');
  }

  function getLetterGrade(val) {
    if (val >= 90) return 'S (Exceptional)';
    if (val >= 75) return 'A+ (Distinction)';
    if (val >= 60) return 'A (First Class)';
    if (val >= 45) return 'B (Pass)';
    return 'C (Marginal)';
  }

  function formatBranchName(b) {
    const map = {
      CSE: "Computer Science & Engineering",
      AI: "Artificial Intelligence & Data Science",
      ECE: "Electronics & Communication Engineering",
      IT: "Information Technology"
    };
    return map[b] || "Engineering";
  }

  function copyGraduationSummary() {
    const p = gameState.player;
    const s = gameState.stats;
    const ending = ENDINGS.find(e => e.id === gameState.finalEnding) || ENDINGS[0];

    const text = `🎓 CAMPUS CHAOS: COLLEGE LIFE SIMULATOR 🎓
------------------------------------------------
Student: ${p.name}
Stream: ${formatBranchName(p.branch)}
Ending: ${ending.title} ${ending.badge}
Honors: ${ending.honors}

FINAL TRANSCRIPT:
• Academics: ${s.academics}/100 (${getLetterGrade(s.academics)})
• Coding Skills: ${s.skills}/100 (${getLetterGrade(s.skills)})
• Energy & Health: ${s.energy}/100 (${getLetterGrade(s.energy)})
• Relationships: ${s.relationships}/100 (${getLetterGrade(s.relationships)})
• Career Readiness: ${s.career}/100 (${getLetterGrade(s.career)})

Key Perks Unlocked: ${gameState.perks.map(x => x.title).join(', ') || 'None'}
Play Campus Chaos in your browser!`;

    navigator.clipboard.writeText(text).then(() => {
      showToast('Graduation summary copied to clipboard!');
      sfx.playClick();
    }).catch(() => {
      showToast('Copied text!');
    });
  }

  /* ==========================================================================
     12. SAVE / LOAD / SETTINGS (LOCALSTORAGE)
     ========================================================================== */

  function saveGame() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
      checkContinueButton();
    } catch (e) {
      console.warn("LocalStorage save failed:", e);
    }
  }

  function loadGame() {
    try {
      const data = localStorage.getItem(SAVE_KEY);
      if (data) {
        gameState = JSON.parse(data);
        return true;
      }
    } catch (e) {
      console.warn("LocalStorage load failed:", e);
    }
    return false;
  }

  function hasSavedGame() {
    return !!localStorage.getItem(SAVE_KEY);
  }

  function resetGame() {
    localStorage.removeItem(SAVE_KEY);
    gameState = JSON.parse(JSON.stringify(DEFAULT_STATE));
    checkContinueButton();
  }

  function checkContinueButton() {
    const btn = document.getElementById('btn-continue');
    if (btn) {
      btn.disabled = !hasSavedGame();
    }
  }

  /* ==========================================================================
     13. INITIALIZATION & EVENT LISTENERS
     ========================================================================== */

  function setupEventListeners() {
    // Top Quick Bar Buttons
    const btnSound = document.getElementById('btn-sound-toggle');
    if (btnSound) {
      btnSound.addEventListener('click', () => {
        const isEnabled = sfx.toggleMute();
        document.getElementById('sound-icon').textContent = isEnabled ? '🔊' : '🔇';
        btnSound.querySelector('.btn-text').textContent = isEnabled ? 'SFX: ON' : 'SFX: OFF';
        document.getElementById('btn-toggle-sfx-modal').classList.toggle('active', isEnabled);
        document.getElementById('btn-toggle-sfx-modal').textContent = isEnabled ? 'ON' : 'OFF';
        if (isEnabled) sfx.playClick();
      });
    }

    const btnPause = document.getElementById('btn-pause-toggle');
    if (btnPause) {
      btnPause.addEventListener('click', () => {
        sfx.playClick();
        showModal('modal-settings');
      });
    }

    // Main Menu Buttons
    document.getElementById('btn-new-game').addEventListener('click', () => {
      sfx.playClick();
      if (hasSavedGame()) {
        showModal('modal-confirm');
      } else {
        startFreshGameSetup();
      }
    });

    document.getElementById('btn-continue').addEventListener('click', () => {
      sfx.playClick();
      if (loadGame()) {
        resumeSavedJourney();
      }
    });

    document.getElementById('btn-how-to-play').addEventListener('click', () => {
      sfx.playClick();
      showModal('modal-howtoplay');
    });

    document.getElementById('btn-credits').addEventListener('click', () => {
      sfx.playClick();
      showModal('modal-howtoplay');
    });

    // Character Setup Screen
    document.getElementById('btn-setup-back').addEventListener('click', () => {
      sfx.playClick();
      switchScreen('screen-menu');
    });

    // Skin options
    document.querySelectorAll('#skin-options .color-dot').forEach(dot => {
      dot.addEventListener('click', (e) => {
        document.querySelectorAll('#skin-options .color-dot').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        gameState.player.avatar.skin = dot.getAttribute('data-color');
        updateAvatarPreview();
        sfx.playClick();
      });
    });

    // Hair options
    document.querySelectorAll('#hair-options .color-dot').forEach(dot => {
      dot.addEventListener('click', (e) => {
        document.querySelectorAll('#hair-options .color-dot').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        gameState.player.avatar.hair = dot.getAttribute('data-color');
        updateAvatarPreview();
        sfx.playClick();
      });
    });

    // Hoodie options
    document.querySelectorAll('#hoodie-options .color-dot').forEach(dot => {
      dot.addEventListener('click', (e) => {
        document.querySelectorAll('#hoodie-options .color-dot').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        gameState.player.avatar.hoodie = dot.getAttribute('data-color');
        updateAvatarPreview();
        sfx.playClick();
      });
    });

    // Branch selection
    document.querySelectorAll('.branch-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.branch-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        gameState.player.branch = chip.getAttribute('data-branch');
        sfx.playClick();
      });
    });

    // Trait selection
    document.querySelectorAll('.trait-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.trait-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        gameState.player.trait = card.getAttribute('data-trait');
        sfx.playClick();
      });
    });

    // Start Game from Setup
    document.getElementById('btn-start-game').addEventListener('click', () => {
      const nameInput = document.getElementById('input-char-name');
      const name = nameInput.value.trim() || 'Alex Ray';
      gameState.player.name = name;

      // Apply initial trait modifiers
      applyInitialTrait(gameState.player.trait);

      sfx.playClick();
      saveGame();
      startGameplay();
    });

    // Gameplay HUD
    document.getElementById('btn-hud-inventory').addEventListener('click', () => {
      sfx.playClick();
      populatePerksModal();
      showModal('modal-inventory');
    });

    document.getElementById('btn-hud-menu').addEventListener('click', () => {
      sfx.playClick();
      showModal('modal-settings');
    });

    // Feedback Next Button
    document.getElementById('btn-feedback-next').addEventListener('click', () => {
      advanceToNextEvent();
    });

    // Chapter Summary Proceed Button
    document.getElementById('btn-next-chapter').addEventListener('click', () => {
      sfx.playClick();
      switchScreen('screen-game');
      loadCurrentEvent();
    });

    // Ending Screen Actions
    document.getElementById('btn-share-ending').addEventListener('click', copyGraduationSummary);
    document.getElementById('btn-restart-game').addEventListener('click', () => {
      sfx.playClick();
      startFreshGameSetup();
    });
    document.getElementById('btn-ending-menu').addEventListener('click', () => {
      sfx.playClick();
      switchScreen('screen-menu');
    });

    // Settings Modal
    document.getElementById('btn-close-settings').addEventListener('click', () => hideModal('modal-settings'));
    document.getElementById('btn-resume-game').addEventListener('click', () => hideModal('modal-settings'));
    document.getElementById('btn-settings-restart').addEventListener('click', () => {
      hideModal('modal-settings');
      showModal('modal-confirm');
    });
    document.getElementById('btn-settings-menu').addEventListener('click', () => {
      hideModal('modal-settings');
      switchScreen('screen-menu');
    });

    document.getElementById('btn-toggle-sfx-modal').addEventListener('click', () => {
      const isEnabled = sfx.toggleMute();
      document.getElementById('btn-toggle-sfx-modal').classList.toggle('active', isEnabled);
      document.getElementById('btn-toggle-sfx-modal').textContent = isEnabled ? 'ON' : 'OFF';
      document.getElementById('sound-icon').textContent = isEnabled ? '🔊' : '🔇';
      document.getElementById('btn-sound-toggle').querySelector('.btn-text').textContent = isEnabled ? 'SFX: ON' : 'SFX: OFF';
    });

    document.getElementById('volume-slider').addEventListener('input', (e) => {
      sfx.setVolume(e.target.value / 100);
    });

    document.getElementById('btn-toggle-crt').addEventListener('click', (e) => {
      const overlay = document.querySelector('.crt-overlay');
      const isActive = overlay.classList.toggle('disabled');
      e.target.classList.toggle('active', !isActive);
      e.target.textContent = isActive ? 'OFF' : 'ON';
    });

    // How to Play Modal
    document.getElementById('btn-close-htp').addEventListener('click', () => hideModal('modal-howtoplay'));
    document.getElementById('btn-htp-gotit').addEventListener('click', () => hideModal('modal-howtoplay'));

    // Perks Modal
    document.getElementById('btn-close-inventory').addEventListener('click', () => hideModal('modal-inventory'));
    document.getElementById('btn-close-inventory-bottom').addEventListener('click', () => hideModal('modal-inventory'));

    // Confirm Modal
    document.getElementById('btn-confirm-yes').addEventListener('click', () => {
      sfx.playClick();
      hideModal('modal-confirm');
      resetGame();
      startFreshGameSetup();
    });
    document.getElementById('btn-confirm-no').addEventListener('click', () => {
      sfx.playClick();
      hideModal('modal-confirm');
    });

    // Keyboard Shortcuts (1, 2, 3, M, Esc, Enter)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'm' || e.key === 'M') {
        const isEnabled = sfx.toggleMute();
        document.getElementById('sound-icon').textContent = isEnabled ? '🔊' : '🔇';
        document.getElementById('btn-sound-toggle').querySelector('.btn-text').textContent = isEnabled ? 'SFX: ON' : 'SFX: OFF';
        return;
      }

      if (e.key === 'Escape') {
        const settings = document.getElementById('modal-settings');
        if (!settings.classList.contains('modal-hidden')) {
          hideModal('modal-settings');
        } else {
          showModal('modal-settings');
        }
        return;
      }

      // If feedback modal is active, Enter advances to next event
      const feedbackModal = document.getElementById('modal-feedback');
      if (!feedbackModal.classList.contains('modal-hidden')) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          advanceToNextEvent();
          return;
        }
      }

      // 1, 2, 3 number hotkeys for choices
      const gameScreen = document.getElementById('screen-game');
      if (gameScreen.classList.contains('screen-active') && feedbackModal.classList.contains('modal-hidden')) {
        const choiceCards = document.querySelectorAll('.choice-card');
        if (e.key === '1' && choiceCards[0]) choiceCards[0].click();
        if (e.key === '2' && choiceCards[1]) choiceCards[1].click();
        if (e.key === '3' && choiceCards[2]) choiceCards[2].click();
      }
    });
  }

  function applyInitialTrait(trait) {
    // Base stats default to 50
    gameState.stats = {
      academics: 50,
      skills: 50,
      energy: 70,
      relationships: 50,
      career: 30
    };

    switch (trait) {
      case 'coder':
        gameState.stats.skills += 10;
        gameState.stats.energy -= 5;
        gameState.perks.push({ id: 'trait_coder', title: 'Code Wizard', desc: '+10 Starting Skills, always has a terminal open.' });
        break;
      case 'scholar':
        gameState.stats.academics += 10;
        gameState.stats.relationships -= 5;
        gameState.perks.push({ id: 'trait_scholar', title: 'Studious Topper', desc: '+10 Starting Academics, notes are legendary.' });
        break;
      case 'socialite':
        gameState.stats.relationships += 10;
        gameState.stats.energy += 5;
        gameState.perks.push({ id: 'trait_socialite', title: 'Campus Connector', desc: '+10 Starting Relationships, knows all clubs.' });
        break;
      case 'hustler':
        gameState.stats.career += 10;
        gameState.stats.academics -= 5;
        gameState.perks.push({ id: 'trait_hustler', title: 'Startup Hustler', desc: '+10 Starting Career Readiness, building in public.' });
        break;
    }
  }

  function startFreshGameSetup() {
    gameState = JSON.parse(JSON.stringify(DEFAULT_STATE));
    updateAvatarPreview();
    switchScreen('screen-setup');
  }

  function startGameplay() {
    // Populate HUD profile
    document.getElementById('hud-player-name').textContent = gameState.player.name;
    document.getElementById('hud-branch-badge').textContent = gameState.player.branch;
    document.getElementById('hud-trait-badge').textContent = formatTraitName(gameState.player.trait);

    updateHudAvatar();
    switchScreen('screen-game');
    loadCurrentEvent();
  }

  function resumeSavedJourney() {
    if (gameState.isCompleted) {
      triggerEndingSequence();
    } else {
      document.getElementById('hud-player-name').textContent = gameState.player.name;
      document.getElementById('hud-branch-badge').textContent = gameState.player.branch;
      document.getElementById('hud-trait-badge').textContent = formatTraitName(gameState.player.trait);

      updateHudAvatar();
      switchScreen('screen-game');
      loadCurrentEvent();
    }
  }

  function formatTraitName(t) {
    const map = {
      coder: "Code Wizard",
      scholar: "Studious Topper",
      socialite: "Campus Connector",
      hustler: "Startup Hustler"
    };
    return map[t] || "Fresher";
  }

  function populatePerksModal() {
    document.getElementById('inv-dept-name').textContent = formatBranchName(gameState.player.branch);
    document.getElementById('inv-trait-name').textContent = formatTraitName(gameState.player.trait);

    const container = document.getElementById('inv-perks-list');
    container.innerHTML = '';

    if (gameState.perks.length === 0) {
      container.innerHTML = '<div class="perk-item">No special perks unlocked yet. Make bold choices!</div>';
      return;
    }

    gameState.perks.forEach(p => {
      const item = document.createElement('div');
      item.className = 'perk-item';
      item.innerHTML = `
        <span style="font-size:18px;">✨</span>
        <div>
          <strong style="color:var(--neon-yellow);">${p.title}</strong>
          <div style="font-size:12px; color:var(--text-secondary);">${p.desc}</div>
        </div>
      `;
      container.appendChild(item);
    });
  }

  /* ==========================================================================
     14. APP ENTRY POINT
     ========================================================================== */
  window.addEventListener('DOMContentLoaded', () => {
    initMenuCanvas();
    setupEventListeners();
    checkContinueButton();
  });

})();
