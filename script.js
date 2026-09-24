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
            url: 'pdf/CV.pdf?v=20260923-v4',
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

// Sparse signatures stay still while visible. A new placement and handwriting
// are chosen at the invisible boundary of each independently staggered cycle.
function initAmbientTags() {
    const layer = document.querySelector('.ambient-tags');
    if (!layer) return;

    const toggle = document.querySelector('.ambient-toggle');
    const label = toggle?.querySelector('.ambient-toggle-label');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const narrowScreen = window.matchMedia('(max-width: 720px)');
    const fonts = ['"Caveat"', '"Allura"', '"Annie Use Your Telescope"'];
    const random = (minimum, maximum) => minimum + Math.random() * (maximum - minimum);
    const tags = [];
    let paused = false;

    const place = tag => {
        const width = layer.clientWidth;
        const height = layer.clientHeight;
        const gutter = document.querySelector('.page')?.getBoundingClientRect().left ?? width * 0.12;
        const mobile = narrowScreen.matches;
        const across = gutter * (0.32 + tag.x * 0.36);
        const x = mobile
            ? width * ((tag.index % 2 === 0 ? 0.14 : 0.6) + tag.x * 0.28)
            : tag.index % 2 === 0 ? across : width - across;
        const y = mobile
            ? height * (0.22 + tag.y * 0.62)
            : height * (0.13 + tag.y * 0.75);
        const baseSize = mobile ? 30 : Math.min(40, Math.max(18, (gutter - 24) / 3.8));
        const size = baseSize * tag.scale;
        tag.node.style.setProperty('--tag-x', `${x.toFixed(1)}px`);
        tag.node.style.setProperty('--tag-y', `${y.toFixed(1)}px`);
        tag.node.style.setProperty('--tag-size', `${size.toFixed(1)}px`);
        tag.node.style.setProperty('--tag-angle', `${tag.angle.toFixed(1)}deg`);
        tag.node.style.setProperty('--tag-font', fonts[tag.font]);
    };
    const renew = (tag, initial = false) => {
        tag.font = initial ? tag.index % fonts.length : (tag.font + 1 + Math.floor(Math.random() * 2)) % fonts.length;
        tag.x = Math.random();
        // Spread simultaneous tags out without tying any tag to a fixed row.
        for (let attempt = 0; attempt < 10; attempt += 1) {
            tag.y = Math.random();
            if (tags.every(other => other === tag || other.index % 2 !== tag.index % 2
                || Math.abs(other.y - tag.y) > 0.18)) break;
        }
        tag.angle = random(-28, 24);
        tag.scale = random(0.65, 1.5);
        tag.node.style.setProperty('--tag-opacity', random(0.055, 0.085).toFixed(3));
        place(tag);
    };

    for (let index = 0; index < 6; index += 1) {
        const node = document.createElement('span');
        node.className = 'ambient-tag';
        node.textContent = 'DripNowhy';
        const duration = random(4.5, 8.5);
        node.style.setProperty('--tag-duration', `${duration.toFixed(1)}s`);
        node.style.setProperty('--tag-delay', `${(-duration * Math.random()).toFixed(1)}s`);
        const tag = { node, index };
        renew(tag, true);
        node.addEventListener('animationiteration', () => renew(tag));
        layer.appendChild(node);
        tags.push(tag);
    }

    const syncPlayback = () => {
        const offscreen = narrowScreen.matches && window.scrollY >= layer.clientHeight;
        layer.classList.toggle('is-paused', paused || document.hidden || offscreen);
        layer.classList.toggle('is-static', reducedMotion.matches);
        if (toggle) toggle.hidden = reducedMotion.matches;
    };

    toggle?.addEventListener('click', () => {
        paused = !paused;
        toggle.setAttribute('aria-pressed', String(paused));
        toggle.setAttribute('aria-label', paused ? 'Resume background animation' : 'Pause background animation');
        if (label) label.textContent = paused ? 'Resume background' : 'Pause background';
        syncPlayback();
    });
    const resize = () => {
        tags.forEach(place);
        syncPlayback();
    };
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', syncPlayback, { passive: true });
    document.addEventListener('visibilitychange', syncPlayback);
    reducedMotion.addEventListener('change', syncPlayback);
    narrowScreen.addEventListener('change', resize);
    syncPlayback();
}

function initThemeToggle() {
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

function initScrollSpy() {
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

    // Empty-space clicks keep the person/cat interaction.
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
    initAmbientTags();
    initThemeToggle();

    const config = await loadConfig();
    renderProfile(config);
    renderNavigation(config);
    renderSocialLinks(config);
    setFooterDate();

    // Runs after renderNavigation, which replaces the nav anchors wholesale.
    const scrollSpy = initScrollSpy();

    await loadAndRenderGitHubRepos();
    externalizeLinks();
    scrollSpy?.refresh();
});
