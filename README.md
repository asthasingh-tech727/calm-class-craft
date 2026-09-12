# Zen Schedule

Build a polished hackathon-ready full-stack prototype called “Smart Timetable Generator with Japanese-Inspired Wellness Scheduling” for Campusathon 2026, based on this proposal data: PS1; target Educational Institutions (Schools/Colleges); stack concept Python, SQLite, CSP Backtracking; 6 days × 8 periods; academic periods 1,2,4,5,7; recovery periods 3,6,8; seven sections: Abstract, Problem Statement, System Architecture, Algorithmic Approach, Core Implementation, Wellness Workflow, Expected Impact. The prototype must be a FUNCTIONAL timetable generator, not just a document explorer. Create a professional responsive dashboard with: (1) Overview dashboard showing 6×8 schedule, conflict count, utilization, wellness score, and algorithm status; (2) Timetable Generator form supporting multiple batches/classes, subjects, faculty, rooms/labs, faculty availability, room capacity/type, electives, and constraints; (3) Generate button that runs a deterministic client-side CSP/backtracking-style scheduler with MRV heuristic and produces a conflict-free schedule when feasible; clearly explain that the demo solver is deterministic and include a fallback message when constraints are infeasible; (4) recovery/wellness periods 3,6,8 visually marked and protected from academic scheduling unless the user explicitly allows them; (5) schedule views by batch, faculty, and room; (6) conflict validator showing faculty/room/batch overlaps and warnings; (7) analytics showing workload balance, room utilization, recovery compliance, and scheduling efficiency; (8) proposal/research tab containing the seven proposal sections, algorithm explanation, architecture diagram-style cards, and Python-like pseudocode/code excerpt; (9) export actions for CSV/JSON and print-friendly PDF summary; (10) sample/demo data preloaded so the app works immediately. Make the UI creative but formal for a hackathon: clean academic-tech visual language, excellent typography, cards, tables, timeline, subtle animations, light/dark mode, mobile responsive. Do not claim actual AI/ML if it is rule-based CSP; label MRV + backtracking accurately. Use local state/localStorage so demo data persists. Add clear “Demo Mode” and “Generate New Timetable” actions. Ensure production build has no compile errors and all buttons/interactions work. Include a polished landing/header with project title, Campusathon 2026, PS1, and a concise value proposition. Prioritize a working prototype over decorative content.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://calm-class-craft.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/eed00e67-98bc-4af9-a276-34b985436e98).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
