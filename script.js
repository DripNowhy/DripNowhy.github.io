const fallbackConfig = {
    profile: {
        name: 'Yi Ding (丁熠)',
        title: 'PhD Student',
        department: 'Computer Science',
        university: 'Purdue University',
        motto: '— DripNowhy',
        image: 'images/yi_photo.jpg'
    },
    social: {
        google_scholar: {
            url: 'https://scholar.google.com/citations?hl=en&user=KywyOjkAAAAJ',
            icon: 'fa-solid fa-graduation-cap',
            title: 'Google Scholar'
        },
        github: {
            url: 'https://github.com/DripNowhy',
            icon: 'fa-brands fa-github',
            title: 'GitHub'
        },
        twitter: {
            url: 'https://x.com/YiDingywhy',
            icon: 'fa-brands fa-x-twitter',
            title: 'Twitter'
        },
        cv: {
            url: 'pdf/CV.pdf',
            icon: 'fa-solid fa-file-lines',
            title: 'CV'
        },
        email: {
            url: 'mailto:ding432@purdue.edu',
            icon: 'fa-solid fa-envelope',
            title: 'Email'
        }
    },
    navigation: {
        about: { url: '#about', title: 'About' },
        research: { url: '#research', title: 'Research' },
        news: { url: '#news', title: 'News' },
        publications: { url: '#publications', title: 'Publications' },
        github: { url: '#github-repos', title: 'GitHub' },
        education: { url: '#education', title: 'Education' },
        services: { url: '#services', title: 'Services' }
    }
};

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function normalizeIcon(icon) {
    if (!icon) return 'fa-solid fa-arrow-up-right-from-square';
    return icon
        .replace(/\bfas\b/g, 'fa-solid')
        .replace(/\bfab\b/g, 'fa-brands')
        .replace(/\bfar\b/g, 'fa-regular')
        .replace('fa-twitter', 'fa-x-twitter')
        .replace('fa-file-alt', 'fa-file-lines')
        .trim();
}

function normalizeAnchor(url) {
    const anchorMap = {
        '#about-anchor': '#about',
        '#research-anchor': '#research',
        '#news-anchor': '#news',
        '#publications-anchor': '#publications',
        '#github-repos-anchor': '#github-repos',
        '#education-anchor': '#education',
        '#services-anchor': '#services'
    };
    return anchorMap[url] || url;
}

async function loadConfig() {
    try {
        const response = await fetch('config.yml', { cache: 'no-store' });
        if (!response.ok || !window.jsyaml) {
            throw new Error('Config unavailable');
        }

        const yamlText = await response.text();
        const parsed = window.jsyaml.load(yamlText) || {};
        return {
            ...fallbackConfig,
            ...parsed,
            profile: { ...fallbackConfig.profile, ...(parsed.profile || {}) },
            social: { ...fallbackConfig.social, ...(parsed.social || {}) },
            navigation: { ...fallbackConfig.navigation, ...(parsed.navigation || {}) }
        };
    } catch (error) {
        return fallbackConfig;
    }
}

function renderProfile(config) {
    const profile = config.profile || {};
    const name = document.querySelector('.hero-name');
    const role = document.querySelector('.hero-role');
    const motto = document.querySelector('.hero-motto');
    const portrait = document.querySelector('.hero-portrait img');

    if (name && profile.name) {
        // "Yi Ding (丁熠)" renders the parenthesised name as a lighter companion.
        const parts = profile.name.match(/^(.*?)\s*[（(](.+?)[)）]\s*$/);
        name.textContent = parts ? parts[1] : profile.name;

        if (parts) {
            const companion = document.createElement('span');
            companion.className = 'hero-name-cn';
            companion.textContent = parts[2];
            name.append(' ', companion);
        }
    }

    if (role) {
        role.textContent = [profile.title, profile.department, profile.university]
            .filter(Boolean)
            .join(' · ');
    }

    if (motto && profile.motto) {
        motto.textContent = profile.motto;
    }

    if (portrait && profile.image) {
        portrait.src = profile.image;
        portrait.alt = profile.name || '';
    }
}

function renderNavigation(config) {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    navLinks.innerHTML = Object.values(config.navigation)
        .filter(link => link.url && link.title)
        .map((link, index) => {
            const href = escapeHtml(normalizeAnchor(link.url));
            const title = escapeHtml(link.title);
            const activeAttributes = index === 0 ? ' class="active" aria-current="location"' : '';
            return `<li><a${activeAttributes} href="${href}">${title}</a></li>`;
        })
        .join('');
}

function renderSocialLinks(config) {
    const socialLinks = document.querySelector('.social-links');
    if (!socialLinks) return;

    socialLinks.innerHTML = Object.values(config.social)
        .filter(link => link.url && link.title)
        .map(link => {
            const href = escapeHtml(link.url);
            const icon = escapeHtml(normalizeIcon(link.icon));
            const title = escapeHtml(link.title);
            const iconMarkup = title.toLowerCase() === 'cv'
                ? '<span class="social-cv-mark" aria-hidden="true">CV</span>'
                : `<i class="${icon}" aria-hidden="true"></i>`;
            return `
                <a href="${href}" title="${title}" aria-label="${title}">
                    ${iconMarkup}
                </a>
            `;
        })
        .join('');
}

function setFooterDate() {
    const footerDate = document.getElementById('footer-update-date');
    if (!footerDate) return;

    footerDate.textContent = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function externalizeLinks() {
    document.querySelectorAll('a[href]').forEach(anchor => {
        const href = anchor.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('mailto:')) return;
        anchor.setAttribute('target', '_blank');
        anchor.setAttribute('rel', 'noopener noreferrer');
    });
}

async function loadAndRenderGitHubRepos() {
    const repoSection = document.querySelector('.github-repo-section');
    if (!repoSection) return;

    repoSection.innerHTML = '<p>Loading repositories...</p>';

    try {
        const response = await fetch('https://api.github.com/users/DripNowhy/repos?per_page=100&sort=updated');
        if (!response.ok) throw new Error('GitHub API unavailable');

        const repos = await response.json();
        if (!Array.isArray(repos)) throw new Error('Invalid repository data');

        const selectedRepos = repos
            .filter(repo => !repo.fork)
            .sort((a, b) => b.stargazers_count - a.stargazers_count)
            .slice(0, 3);

        if (selectedRepos.length === 0) {
            repoSection.innerHTML = '<p>No public repositories found.</p>';
            return;
        }

        repoSection.innerHTML = `
            <div class="github-repo-grid">
                ${selectedRepos.map(repo => `
                    <article class="github-repo-card">
                        <div class="repo-title">
                            <a href="${escapeHtml(repo.html_url)}">
                                <i class="fa-solid fa-book" aria-hidden="true"></i>
                                ${escapeHtml(repo.name)}
                            </a>
                        </div>
                        <div class="repo-desc">${escapeHtml(repo.description || '')}</div>
                        <div class="repo-meta">
                            ${repo.language ? `<span class="repo-lang"><span class="repo-dot"></span>${escapeHtml(repo.language)}</span>` : ''}
                            <span class="repo-stars"><i class="fa-solid fa-star" aria-hidden="true"></i> ${escapeHtml(repo.stargazers_count)}</span>
                            <span class="repo-forks"><i class="fa-solid fa-code-branch" aria-hidden="true"></i> ${escapeHtml(repo.forks_count)}</span>
                        </div>
                    </article>
                `).join('')}
            </div>
        `;
    } catch (error) {
        repoSection.innerHTML = '<p>Failed to load repositories.</p>';
    }
}

function createCharacterJourney(stage, reducedMotion) {
    const sprites = {
        personWalk: stage?.querySelector('[data-sprite="person-walk"]'),
        personPhone: stage?.querySelector('[data-sprite="person-phone"]'),
        catWalk: stage?.querySelector('[data-sprite="cat-walk"]'),
        catRest: stage?.querySelector('[data-sprite="cat-rest"]'),
        catRoll: stage?.querySelector('[data-sprite="cat-roll"]')
    };

    if (!stage || Object.values(sprites).some(sprite => !sprite)) {
        return { move: () => {}, interact: () => {} };
    }

    const frameCount = 8;
    const lastFrame = frameCount - 1;
    const personRestFrame = 3;
    const catRestFrame = 1;
    const catPhaseOffset = 2;
    const walkStopDelay = 210;
    const stopDelay = 820;
    const directionVelocityThreshold = 80;
    const resumeVelocityThreshold = 48;
    let state = 'initial';
    let actionFrame = 0;
    let walkFrame = personRestFrame;
    let currentVelocity = 0;
    let lastMotionAt = 0;
    let lastWalkTickAt = performance.now();
    let walkElapsed = 0;
    let walkAnimationFrame = 0;
    let sequenceAnimationFrame = 0;
    let sequenceToken = 0;
    let stopTimer = 0;
    let flashTimer = 0;

    const clamp = (minimum, value, maximum) => (
        Math.min(maximum, Math.max(minimum, value))
    );

    const setFrame = (sprite, frame) => {
        const safeFrame = clamp(0, Math.round(frame), lastFrame);
        sprite.style.setProperty('--sprite-offset', `${safeFrame * -12.5}%`);
    };

    const setMode = mode => {
        stage.classList.toggle('is-rest-action', mode === 'action');
        stage.classList.toggle('is-cat-rolling', mode === 'roll');
    };

    const renderWalkingFrame = frame => {
        setFrame(sprites.personWalk, frame);
        setFrame(sprites.catWalk, (frame + catPhaseOffset) % frameCount);
    };

    const renderActionFrame = frame => {
        actionFrame = clamp(0, frame, lastFrame);
        setFrame(sprites.personPhone, actionFrame);
        setFrame(sprites.catRest, actionFrame);
    };

    const renderRollFrame = frame => {
        setFrame(sprites.personPhone, lastFrame);
        setFrame(sprites.catRoll, frame);
    };

    const cancelSequence = () => {
        sequenceToken += 1;
        if (sequenceAnimationFrame) {
            window.cancelAnimationFrame(sequenceAnimationFrame);
            sequenceAnimationFrame = 0;
        }
    };

    const playFrames = ({ from, to, frameDuration, render, complete }) => {
        cancelSequence();
        const token = sequenceToken;
        const direction = to >= from ? 1 : -1;
        const frameDistance = Math.abs(to - from);
        const startedAt = performance.now();
        let renderedFrame = null;

        const draw = frame => {
            if (frame === renderedFrame) return;
            renderedFrame = frame;
            render(frame);
        };

        draw(from);

        if (frameDistance === 0) {
            complete?.();
            return;
        }

        const tick = now => {
            if (token !== sequenceToken) return;

            const frameStep = Math.min(
                frameDistance,
                Math.floor((now - startedAt) / frameDuration)
            );
            draw(from + frameStep * direction);

            if (frameStep >= frameDistance) {
                sequenceAnimationFrame = 0;
                complete?.();
                return;
            }

            sequenceAnimationFrame = window.requestAnimationFrame(tick);
        };

        sequenceAnimationFrame = window.requestAnimationFrame(tick);
    };

    const stopWalkLoop = () => {
        if (walkAnimationFrame) {
            window.cancelAnimationFrame(walkAnimationFrame);
            walkAnimationFrame = 0;
        }
        walkElapsed = 0;
    };

    const walkTick = now => {
        if (state !== 'walking') {
            walkAnimationFrame = 0;
            return;
        }

        const timeSinceMotion = now - lastMotionAt;

        if (timeSinceMotion >= walkStopDelay) {
            walkAnimationFrame = 0;
            walkElapsed = 0;
            walkFrame = personRestFrame;
            renderWalkingFrame(walkFrame);
            stage.classList.remove('is-walking');
            return;
        }

        const delta = Math.min(64, now - lastWalkTickAt);
        const baseFps = clamp(6, 5 + Math.abs(currentVelocity) / 180, 14);
        const slowdown = clamp(0.58, 1 - timeSinceMotion / 280, 1);
        const frameDuration = 1000 / (baseFps * slowdown);
        lastWalkTickAt = now;
        walkElapsed += delta;

        if (walkElapsed >= frameDuration) {
            const frameSteps = Math.max(1, Math.floor(walkElapsed / frameDuration));
            walkFrame = (walkFrame + frameSteps) % frameCount;
            walkElapsed %= frameDuration;
            renderWalkingFrame(walkFrame);
        }

        walkAnimationFrame = window.requestAnimationFrame(walkTick);
    };

    const startWalkLoop = () => {
        if (walkAnimationFrame) return;
        lastWalkTickAt = performance.now();
        walkAnimationFrame = window.requestAnimationFrame(walkTick);
    };

    const clearStopTimer = () => {
        window.clearTimeout(stopTimer);
        stopTimer = 0;
    };

    const scheduleRest = delay => {
        clearStopTimer();
        stopTimer = window.setTimeout(() => {
            stopTimer = 0;
            beginRestAction();
        }, delay);
    };

    const triggerFlash = () => {
        window.clearTimeout(flashTimer);
        stage.classList.remove('is-flashing');
        void stage.offsetWidth;
        stage.classList.add('is-flashing');
        flashTimer = window.setTimeout(() => {
            stage.classList.remove('is-flashing');
        }, 340);
    };

    const beginRestAction = () => {
        if (state === 'resuming') {
            scheduleRest(90);
            return;
        }

        if (state !== 'walking') return;

        stopWalkLoop();
        stage.classList.remove('is-walking', 'is-character-resting');
        setMode('action');
        state = 'settling';
        renderActionFrame(0);
        playFrames({
            from: 0,
            to: lastFrame,
            frameDuration: 78,
            render: renderActionFrame,
            complete: () => {
                state = 'resting';
                stage.classList.add('is-character-resting');
            }
        });
    };

    const startWalking = () => {
        cancelSequence();
        stage.classList.remove(
            'is-rest-action',
            'is-cat-rolling',
            'is-character-resting',
            'is-flashing'
        );
        setMode('walk');
        state = 'walking';
        stage.classList.add('is-walking');
        renderWalkingFrame(walkFrame);
        startWalkLoop();
    };

    const resumeFromRest = () => {
        if (state === 'resuming') return;

        const resumeFromFrame = state === 'flipping' ? lastFrame : actionFrame;
        cancelSequence();
        stopWalkLoop();
        window.clearTimeout(flashTimer);
        stage.classList.remove('is-character-resting', 'is-flashing', 'is-cat-rolling');
        setMode('action');
        state = 'resuming';
        renderActionFrame(resumeFromFrame);

        playFrames({
            from: resumeFromFrame,
            to: 0,
            frameDuration: 52,
            render: renderActionFrame,
            complete: () => {
                walkFrame = personRestFrame;
                renderWalkingFrame(walkFrame);
                setMode('walk');
                state = 'walking';
                stage.classList.add('is-walking');
                startWalkLoop();

                const timeSinceMotion = performance.now() - lastMotionAt;
                scheduleRest(Math.max(90, stopDelay - timeSinceMotion));
            }
        });
    };

    renderWalkingFrame(walkFrame);
    renderActionFrame(0);
    renderRollFrame(0);
    setMode('walk');

    if (reducedMotion) {
        return { move: () => {}, interact: () => {} };
    }

    return {
        move(scrollVelocity) {
            if (!Number.isFinite(scrollVelocity) || Math.abs(scrollVelocity) < 6) return;

            const needsCommittedResume = !['initial', 'walking'].includes(state);
            if (
                needsCommittedResume
                && Math.abs(scrollVelocity) < resumeVelocityThreshold
            ) return;

            currentVelocity = scrollVelocity;
            lastMotionAt = performance.now();

            if (Math.abs(scrollVelocity) >= directionVelocityThreshold) {
                stage.classList.toggle('is-reversing', scrollVelocity < 0);
            }

            clearStopTimer();

            if (state === 'initial') {
                startWalking();
            } else if (state === 'walking') {
                stage.classList.add('is-walking');
                startWalkLoop();
            } else if (state !== 'resuming') {
                resumeFromRest();
            }

            scheduleRest(stopDelay);
        },

        interact() {
            if (state !== 'resting') return;

            const shouldFlash = Math.random() < 0.34;
            const flashFrame = 4;
            let hasFlashed = false;
            state = 'flipping';
            stage.classList.remove('is-character-resting');
            setMode('roll');

            playFrames({
                from: 0,
                to: lastFrame,
                frameDuration: 84,
                render: frame => {
                    renderRollFrame(frame);
                    if (shouldFlash && !hasFlashed && frame >= flashFrame) {
                        hasFlashed = true;
                        triggerFlash();
                    }
                },
                complete: () => {
                    renderActionFrame(lastFrame);
                    setMode('action');
                    state = 'resting';
                    stage.classList.add('is-character-resting');
                }
            });
        }
    };
}

// Conway's Game of Life, painted very faintly behind the page. Cells fade in as
// they are born and fade out as they die, so the field breathes rather than blinks.
function initLifeField() {
    const noop = { toggleAt: () => {}, syncTheme: () => {} };
    const canvas = document.querySelector('.life-canvas');
    if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return noop;

    const context = canvas.getContext('2d');
    if (!context) return noop;

    const readingColumn = document.querySelector('.page');
    const CELL = 24;
    const GAP = 4;
    const TICK = 780;
    const FADE = 0.085;

    let cols = 0;
    let rows = 0;
    let alive = new Uint8Array(0);
    let scratch = new Uint8Array(0);
    let alpha = new Float32Array(0);
    let colour = 'rgba(0, 0, 0, 0.05)';
    let width = 0;
    let height = 0;
    let lastTick = 0;
    let frame = 0;

    const sprinkle = density => {
        for (let i = 0; i < alive.length; i += 1) {
            if (Math.random() < density) alive[i] = 1;
        }
    };

    const resize = () => {
        width = window.innerWidth;
        height = window.innerHeight;

        const ratio = Math.min(2, window.devicePixelRatio || 1);
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        context.setTransform(ratio, 0, 0, ratio, 0, 0);

        const nextCols = Math.ceil(width / CELL) + 1;
        const nextRows = Math.ceil(height / CELL) + 1;
        if (nextCols === cols && nextRows === rows) return;

        const previous = { cols, rows, alive, alpha };
        cols = nextCols;
        rows = nextRows;
        alive = new Uint8Array(cols * rows);
        scratch = new Uint8Array(cols * rows);
        alpha = new Float32Array(cols * rows);

        if (previous.cols) {
            // Carry the live pattern across the resize instead of restarting.
            const spanX = Math.min(cols, previous.cols);
            const spanY = Math.min(rows, previous.rows);
            for (let y = 0; y < spanY; y += 1) {
                for (let x = 0; x < spanX; x += 1) {
                    alive[y * cols + x] = previous.alive[y * previous.cols + x];
                    alpha[y * cols + x] = previous.alpha[y * previous.cols + x];
                }
            }
        } else {
            sprinkle(0.09);
        }
    };

    const step = () => {
        let population = 0;

        for (let y = 0; y < rows; y += 1) {
            const up = (y - 1 + rows) % rows;
            const down = (y + 1) % rows;

            for (let x = 0; x < cols; x += 1) {
                const left = (x - 1 + cols) % cols;
                const right = (x + 1) % cols;
                const neighbours =
                    alive[up * cols + left] + alive[up * cols + x] + alive[up * cols + right] +
                    alive[y * cols + left] + alive[y * cols + right] +
                    alive[down * cols + left] + alive[down * cols + x] + alive[down * cols + right];
                const lives = neighbours === 3 || (alive[y * cols + x] === 1 && neighbours === 2);

                scratch[y * cols + x] = lives ? 1 : 0;
                if (lives) population += 1;
            }
        }

        alive.set(scratch);

        // Left alone a Conway field stalls; keep a low simmer so it never dies out.
        if (population < alive.length * 0.025) sprinkle(0.05);
    };

    const draw = now => {
        frame = window.requestAnimationFrame(draw);

        if (now - lastTick >= TICK) {
            lastTick = now;
            step();
        }

        context.clearRect(0, 0, width, height);
        context.fillStyle = colour;

        const size = CELL - GAP;
        for (let index = 0; index < alive.length; index += 1) {
            const target = alive[index];
            let level = alpha[index];

            if (level !== target) {
                level = target ? Math.min(1, level + FADE) : Math.max(0, level - FADE);
                alpha[index] = level;
            }

            if (level <= 0.02) continue;

            context.globalAlpha = level;
            context.fillRect((index % cols) * CELL, Math.floor(index / cols) * CELL, size, size);
        }

        context.globalAlpha = 1;
    };

    const start = () => {
        if (frame) return;
        lastTick = performance.now();
        frame = window.requestAnimationFrame(draw);
    };

    const stop = () => {
        if (!frame) return;
        window.cancelAnimationFrame(frame);
        frame = 0;
    };

    const syncTheme = () => {
        const value = getComputedStyle(document.documentElement)
            .getPropertyValue('--life-cell')
            .trim();
        if (value) colour = value;
    };

    resize();
    syncTheme();
    start();

    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) stop();
        else start();
    });

    return {
        syncTheme,

        // Click a populated patch to wipe it, empty space to seed a new colony.
        toggleAt(clientX, clientY) {
            // Only the gutters are painted, so only the gutters are playable.
            const reading = readingColumn?.getBoundingClientRect();
            if (reading && clientX > reading.left && clientX < reading.right) return;

            const column = Math.floor(clientX / CELL);
            const row = Math.floor(clientY / CELL);
            if (column < 0 || row < 0 || column >= cols || row >= rows) return;

            const at = (dx, dy) => (
                ((row + dy + rows) % rows) * cols + ((column + dx + cols) % cols)
            );

            let occupied = 0;
            for (let dy = -1; dy <= 1; dy += 1) {
                for (let dx = -1; dx <= 1; dx += 1) occupied += alive[at(dx, dy)];
            }

            const clearing = occupied >= 3;
            for (let dy = -1; dy <= 1; dy += 1) {
                for (let dx = -1; dx <= 1; dx += 1) {
                    alive[at(dx, dy)] = clearing ? 0 : (Math.random() < 0.55 ? 1 : 0);
                }
            }

            if (!clearing) alive[at(0, 0)] = 1;
        }
    };
}

function initThemeToggle(life) {
    const toggle = document.querySelector('.theme-toggle');
    if (!toggle) return;

    const icon = toggle.querySelector('i');

    const apply = theme => {
        document.documentElement.dataset.theme = theme;
        if (icon) {
            icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        }
        toggle.setAttribute(
            'aria-label',
            theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
        );
        life?.syncTheme();
    };

    // The inline head script has already resolved the initial theme.
    apply(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');

    toggle.addEventListener('click', () => {
        const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        apply(next);
        try {
            localStorage.setItem('theme', next);
        } catch (error) {
            // Storage unavailable (private mode); the theme still applies for this visit.
        }
    });

    // Keep following the OS until the visitor makes an explicit choice.
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        let stored = null;
        try {
            stored = localStorage.getItem('theme');
        } catch (error) {
            stored = null;
        }
        if (!stored) apply(event.matches ? 'dark' : 'light');
    });
}

function initScrollSpy(life) {
    const stage = document.querySelector('.traveler-stage');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const journey = createCharacterJourney(stage, reducedMotion);
    const trail = document.querySelector('.trail');
    const readout = document.querySelector('.trail-readout');
    const topbar = document.querySelector('.topbar');
    const navList = document.querySelector('.nav-links');
    const records = Array.from(document.querySelectorAll('.nav-links a'))
        .map(anchor => {
            const href = anchor.getAttribute('href');
            const section = href?.startsWith('#') ? document.querySelector(href) : null;
            return section ? { anchor, section, id: section.id } : null;
        })
        .filter(Boolean);

    let positions = [];
    let currentId = '';
    let lastScroll = window.scrollY;
    let lastScrollAt = performance.now();
    let frame = 0;

    const centerMobileLink = anchor => {
        if (!navList || window.innerWidth > 720) return;

        const targetLeft = anchor.offsetLeft - (navList.clientWidth - anchor.offsetWidth) / 2;
        navList.scrollTo({
            left: Math.max(0, targetLeft),
            behavior: reducedMotion ? 'auto' : 'smooth'
        });
    };

    const setActive = id => {
        if (!id || id === currentId) return;

        currentId = id;
        records.forEach(record => {
            const isActive = record.id === id;
            record.anchor.classList.toggle('active', isActive);

            if (isActive) {
                record.anchor.setAttribute('aria-current', 'location');
                centerMobileLink(record.anchor);
            } else {
                record.anchor.removeAttribute('aria-current');
            }
        });
    };

    const measure = () => {
        const scrollTop = window.scrollY;
        positions = records.map(record => ({
            ...record,
            top: record.section.getBoundingClientRect().top + scrollTop
        }));
    };

    const sync = () => {
        frame = 0;

        const scrollPosition = window.scrollY;
        topbar?.classList.toggle('is-stuck', scrollPosition > 8);

        // Drives both the horizontal walk position and the drawn-in trail line.
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollable > 0
            ? Math.min(1, Math.max(0, scrollPosition / scrollable))
            : 0;
        trail?.style.setProperty('--journey-progress', progress.toFixed(4));
        if (readout) readout.textContent = `${Math.round(progress * 100)}%`;

        const readingLine = scrollPosition + window.innerHeight * 0.35;
        let active = positions[0];
        positions.forEach(record => {
            if (record.top <= readingLine) active = record;
        });

        if (active) setActive(active.id);

        const now = performance.now();
        const scrollDelta = scrollPosition - lastScroll;

        if (Math.abs(scrollDelta) > 0.5) {
            journey.move(scrollDelta / Math.max(1, now - lastScrollAt) * 1000);
        }

        lastScroll = scrollPosition;
        lastScrollAt = now;
    };

    const schedule = () => {
        if (frame) return;
        frame = window.requestAnimationFrame(sync);
    };

    const refresh = () => {
        measure();
        schedule();
    };

    records.forEach(record => {
        record.anchor.addEventListener('click', event => {
            event.preventDefault();
            setActive(record.id);
            journey.move(record.section.getBoundingClientRect().top >= 0 ? 900 : -900);
            record.section.scrollIntoView({
                behavior: reducedMotion ? 'auto' : 'smooth',
                block: 'start'
            });
            window.history.pushState(null, '', `#${record.id}`);
        });
    });

    // A click on empty page space stamps or clears a Conway colony, and nudges
    // the pair out of their rest pose.
    document.addEventListener('click', event => {
        if (event.defaultPrevented || event.detail === 0) return;

        const target = event.target instanceof Element ? event.target : null;
        if (!target || target.closest(
            'a, button, input, textarea, select, summary, label, ' +
            '[role="button"], [contenteditable="true"]'
        )) return;

        // Don't fire while the visitor is selecting text.
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed) return;

        life?.toggleAt(event.clientX, event.clientY);
        journey.interact();
    });

    measure();
    sync();

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', refresh);
    window.addEventListener('load', refresh, { once: true });

    return { refresh };
}

document.addEventListener('DOMContentLoaded', async () => {
    const life = initLifeField();
    initThemeToggle(life);

    const config = await loadConfig();
    renderProfile(config);
    renderNavigation(config);
    renderSocialLinks(config);
    setFooterDate();

    // Runs after renderNavigation, which replaces the nav anchors wholesale.
    const scrollSpy = initScrollSpy(life);

    await loadAndRenderGitHubRepos();
    externalizeLinks();
    scrollSpy?.refresh();
});
