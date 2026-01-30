# Trent's Top Ten - Project Context

## What This Is
A personal website ranking Trent's top 10 albums of each year. Hosted on GitHub Pages at `trent-wiens.github.io`.

## Repo Location
The deployable repo is in `Trent-Wiens.github.io/`. The parent `All Top 10s/` folder is the working directory — copy finalized files into the repo folder before committing.

## Structure
```
All Top 10s/
├── index.html              # Landing page linking to each year
├── 2024/                   # 2024 list (Y2K retro theme)
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── images/
├── 2025/                   # 2025 list (modern editorial theme)
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   ├── images/
│   ├── Ratings.csv         # Radar chart data (not deployed)
│   └── albums.md           # Album links reference (not deployed)
├── CLAUDE.md               # This file
└── Trent-Wiens.github.io/  # Git repo for deployment
```

## Adding a New Year
1. Copy the `2025/` folder as a template (it's the most current design).
2. Update album names, artists, images, and streaming links in `index.html`.
3. Update radar chart ratings in `script.js` — axes are: Production, Lyrics, Vocals, Replay Value, Cohesion, Originality (scale 1-10).
4. Add a new year card to the root `index.html`.
5. To deploy: copy the new folder + updated root `index.html` into `Trent-Wiens.github.io/`, commit, and push.

## 2025 Design Conventions
- **Font:** Inter (Google Fonts CDN)
- **Background:** #0a0a0a with CSS noise texture
- **Accent color:** Muted gold #d4a054 (artist names, chart fills)
- **Cards:** Glassmorphism — `rgba(255,255,255,0.03)` background, `backdrop-filter: blur(12px)`, 1px border
- **Radar charts:** Chart.js v4 via CDN, translucent amber fill
- **Page order:** Honorable mentions → divider → albums 10 down to 1
- **No reviews** — just album art, name, artist, streaming links, and radar chart
- **Album art images:** Named in PascalCase (e.g., `LetGodSortEmOut.jpg`), stored in `images/`
- **Streaming icons:** `Spotify.png` and `Apple_Music_Icon_RGB_lg_073120.svg` in `images/`

## Data Files (Not Deployed)
- `Ratings.csv` — columns: Album Name, Production, Originality, Cohesion, Replay Value, Vocals, Lyrics
- `albums.md` — comma-separated: rank, album name, artist, spotify link, apple music link

## Things to Exclude from Repo
When copying to `Trent-Wiens.github.io/`, remove: `Ratings.csv`, `albums.md`, `CLAUDE.md`, any `.DS_Store` files.
