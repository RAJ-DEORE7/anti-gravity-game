# Anti-Gravity Platformer

A complete, production-ready 2D Side-Scrolling Anti-Gravity Platformer Game built with vanilla JavaScript, HTML5 Canvas, Web Audio API, and a Node.js Express backend.

## Project Structure

- `/frontend` - Contains all client-side code (HTML, CSS, JS). No external assets are used; everything is drawn via Canvas API and sound is generated procedurally via the Web Audio API.
- `/backend` - Contains a lightweight Node.js Express server to serve the game files and host the Leaderboard REST API.
- `schema.sql` - Supabase PostgreSQL database schema.

## Setup & Installation

1. Make sure you have [Node.js](https://nodejs.org/) installed on your machine.
2. Open a terminal in this project's root directory.
3. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

### Database Setup (Supabase)
This game supports an online leaderboard using Supabase.
1. Create a project on [Supabase](https://supabase.com/).
2. Navigate to the **SQL Editor** in your Supabase dashboard.
3. Copy the contents of `schema.sql` and run it to create the `leaderboard` table and security policies.
4. Go to **Project Settings > API** to find your keys.
5. In the `backend` folder, rename the provided `.env` variables with your actual keys:
   ```env
   SUPABASE_URL=your_supabase_project_url_here
   SUPABASE_ANON_KEY=your_supabase_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

### Running the Game
1. Start the game server:
   ```bash
   cd backend
   npm start
   ```
2. Open your web browser and navigate to `http://localhost:3000`.

## Game Mechanics & Controls

- **Movement:** Use `Left Arrow`/`Right Arrow` or `A`/`D` keys to move the player horizontally.
- **Gravity Flip (Core Mechanic):** Press `Spacebar` to instantly flip the gravity 180 degrees. If you are on the floor, you will fall up to the ceiling. If you are on the ceiling, you will fall down to the floor. Note: You can only flip gravity when grounded or when vertical momentum is neutral.
- **Hazards:** Avoid the red glowing spikes on the floor and ceiling.
- **Enemies:** Pink alien cyclops patrol platforms. 
  - *Gravity Crush Mechanic:* You can kill enemies by flipping gravity and crushing them against the surface from above (or below, if falling up). This grants bonus points.
- **Collectibles:** Yellow glowing orbs grant extra points.
- **Goal:** Reach the glowing rainbow portal at the end of each level to proceed to the next, increasingly difficult stage.

## Features
- **Procedural Web Audio API Sound Effects:** All sounds (flips, jumps, collection, crush, death, win) are synthesized dynamically in code.
- **Neon Glassmorphism UI:** Retro glowing aesthetics built entirely with CSS and Canvas.
- **Backend Leaderboard API:** Submit your 3-letter initials and save your high score to the Supabase-powered server!

Enjoy the game!
