# Adding projects and devlog entries

Every project is one Markdown file in `src/content/projects/`. The page at
`/projects/<file-name>/` is built from its front matter (the part between the `---` lines).

## New project

1. Copy `src/content/projects/8-led-cascade.md` and rename it, e.g. `weather-station-esp32.md`.
2. Edit the fields. Keep `status: in-progress` while you are building it.
3. It appears in **Right now** on the home page, and its page lives at `/projects/weather-station-esp32/`.

## New devlog entry

Add it at the **top** of `devlog:` (newest first). Never delete old entries.

```yaml
devlog:
  - date: 12 Nov 2026
    title: Found the bad joint
    text: The 8th LED had a cold solder joint on its resistor.
```

Also update `lastUpdated`, the `steps` (`done` / `doing` / `next`) and `progress` (0–100).

## Finishing a project

Change `status` to `completed` and add `finished`, `duration`, `result`, `finalEntry`,
a `metrics` list and a `date` on every step. The URL stays the same; the project moves
from Right now to Projects.

Photos and videos go in `public/` and are referenced from the root, e.g. `photo: /projects/led/bench.jpg`.
