# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static academic portfolio website for Yi Ding, a PhD student at Purdue University. The site is built with pure HTML/CSS/JavaScript - no build framework or compilation step required.

## Development Server

Since this is a static site using ES modules and YAML fetching, you must use a local server (not file:// protocol):

```bash
# Python
python -m http.server

# Node.js
npx http-server
```

## Architecture

### Content Management
- **Static content** is embedded directly in `index.html` - edit this file to update content
- **Dynamic configuration** is loaded from `config.yml` (navigation, profile info, social links)

### Key Files
- `index.html` - Main homepage with all content sections
- `config.yml` - Personal info, navigation structure, social links
- `script.js` - Navigation loader, theme toggle, GitHub API integration
- `styles.css` - Light/dark theme support via CSS custom properties
- `ETA.html` - Research project page example (uses Bulma CSS)

### Theme System
- Three modes: auto (default), light, dark
- Auto mode switches based on local time (6am-6pm = light, else dark)
- Theme preference stored in localStorage
- CSS custom properties in `styles.css` handle color variables

### GitHub Integration
- Fetches repos from `api.github.com/users/DripNowhy/repos`
- Displays top 3 non-fork repos sorted by stars
- Rendered dynamically in the GitHub section

## Adding Publications

Publications are static HTML in `index.html`. Each publication follows this structure:

```html
<div class="publication-item">
    <div class="publication-image">
        <img src="images/figure.png" alt="Paper figure">
    </div>
    <div class="publication-content">
        <div class="publication-title">Paper Title</div>
        <div class="publication-authors">Author List with <strong>Yi Ding</strong></div>
        <div class="publication-journal">Conference/Journal Name</div>
        <div class="publication-tldr">One-line summary</div>
        <div class="publication-links">
            <a href="paper-url" target="_blank"><i class="fas fa-file-pdf"></i> Paper</a>
            <a href="code-url" target="_blank"><i class="fas fa-code"></i> Code</a>
            <a href="project-url" target="_blank"><i class="fas fa-globe"></i> Project</a>
        </div>
    </div>
</div>
```

## Project Pages

Research papers with dedicated pages (like `ETA.html`) use:
- Bulma CSS framework (loaded from CDN)
- FontAwesome icons
- MathJax for math rendering
- Image carousels via Bulma extensions

Create new project pages by copying `ETA.html` structure and updating content.

## Assets

- `images/` - Profile photos, publication figures, university logos
- `pdf/CV.pdf` - Curriculum vitae
- Keep publication figures at reasonable size (~500KB max)
- Use SVG for logos when possible
