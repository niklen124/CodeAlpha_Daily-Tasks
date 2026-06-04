# 📓 Folio — Daily Planner

A daily task manager with a **handcrafted notebook aesthetic**, built entirely in vanilla HTML/CSS/JS — no back-end, no install, no dependencies.

---

## ✨ Overview

Folio mimics the look and feel of a real spiral notebook lying on a dark wooden desk. Every detail is considered: leather spine, metallic coils drawn in SVG, lined paper with a red margin, grain texture, and dog-eared corners. The goal is to make task management as enjoyable visually as a physical object.

---

## 🚀 Quick Start

No installation needed. Just open the file in a browser:

```bash
open index.html
```

Tasks are saved automatically in the browser's `localStorage` under the key `folio-v4`.

---

## 🎯 Features

### Task Management
- **Add** a task via the text field or by pressing `Enter`
- **Complete** a task with the animated round checkbox (pop effect)
- **Edit** a task inline (pencil icon) or via the detail modal
- **Delete** with undo support via toast notification
- **Reorder** by drag & drop

### Per-task Metadata
- **Priority**: Urgent / Normal / Low (colored dot with glow)
- **Due date**: highlighted if overdue (red) or due today (amber)
- **Tag**: short label displayed as a colored badge
- **Note**: free-text annotation visible in the detail modal

### Filters & Sorting
- Tabs: **All / Active / Done / Urgent**
- Cyclic sort: default order → priority → due date → A–Z
- **Hide completed tasks** toggle
- **Live search** by task text

### Import / Export
- Timestamped JSON export (`folio-tasks-YYYY-MM-DD.json`)
- JSON import (merged with existing tasks)

### Stats
- Animated progress ring (% complete)
- Pills: total / done / remaining / urgent
- Progress bar at the bottom of the page

---

## 🎨 Design & Tech

| Element | Choice |
|---|---|
| Styling | CSS custom properties + Tailwind CDN |
| Typography | Cormorant Garamond (headings), DM Mono (UI), Caveat (tasks) |
| Coils | SVG generated dynamically in JavaScript |
| Animations | CSS keyframes (`taskIn`, `checkPop`, `slideUp`) |
| Persistence | `localStorage` (key `folio-v4`) |
| Dependencies | None (Google Fonts + Tailwind via CDN only) |

### Color Palette

```
--paper    #faf3e0   Warm paper background
--ink      #1a120a   Dark ink
--ruby     #9b2335   Primary accent (red)
--sage     #2d5a3d   Green (completed tasks)
--amber    #b8720a   Amber (urgent tasks)
--spine    #1e1108   Leather binding
```

---

## 📁 File Structure

The entire project lives in **a single self-contained HTML file**:

```
index.html
├── <head>          Tailwind config, Google Fonts imports
├── <style>         ~350 lines of CSS (variables, components, animations)
├── <body>          Notebook HTML structure (spine, coils, paper)
│   ├── Header      Date, progress ring, stat pills
│   ├── Search bar  Search + sort + toggle
│   ├── Add bar     Text input + priority + due date + tag + note
│   ├── Filter tabs All / Active / Done / Urgent
│   ├── Task list   Dynamically rendered <ul>
│   ├── Footer      Export / Import buttons
│   └── Bottom deco Progress bar + decorative ruled lines
└── <script>        ~570 lines of JS (state, rendering, events)
```

---

## 🌐 Compatibility

Tested on modern browsers (Chrome, Firefox, Safari, Edge). Requires JavaScript enabled. Responsive from 360 px width.

---

## 📝 License

Code Alpha project.