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
    const profileInfo = document.querySelector('.profile-info');
    const profileImage = document.querySelector('.profile-image img');
    if (!profileInfo) return;

    profileInfo.querySelector('h1').textContent = config.profile.name;
    profileInfo.querySelector('.title').textContent = config.profile.title;
    profileInfo.querySelector('.department').textContent = config.profile.department;
    profileInfo.querySelector('.university').textContent = config.profile.university;
    profileInfo.querySelector('.profile-motto').textContent = config.profile.motto;

    if (profileImage) {
        profileImage.src = config.profile.image;
        profileImage.alt = config.profile.name;
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

function initJourneyState() {
    const navList = document.querySelector('.nav-links');
    const navAnchors = Array.from(document.querySelectorAll('.nav-links a'));
    const stage = document.querySelector('.traveler-stage');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const characterJourney = createCharacterJourney(stage, reducedMotion);
    const records = navAnchors
        .map((anchor, index) => {
            const href = anchor.getAttribute('href');
            const section = href?.startsWith('#') ? document.querySelector(href) : null;
            return section ? { anchor, section, id: section.id, index } : null;
        })
        .filter(Boolean);

    if (records.length === 0) return;

    let currentScene = '';
    let sectionPositions = [];
    let lastScroll = window.scrollY;
    let lastScrollAt = performance.now();

    const centerMobileLink = anchor => {
        if (!navList || window.innerWidth > 820) return;
        const targetLeft = anchor.offsetLeft - (navList.clientWidth - anchor.offsetWidth) / 2;
        navList.scrollTo({
            left: Math.max(0, targetLeft),
            behavior: reducedMotion ? 'auto' : 'smooth'
        });
    };

    const setActiveScene = id => {
        if (!id || id === currentScene) return;

        currentScene = id;
        document.body.dataset.scene = id;

        navAnchors.forEach(anchor => {
            const isActive = anchor.getAttribute('href') === `#${id}`;
            anchor.classList.toggle('active', isActive);
            if (isActive) {
                anchor.setAttribute('aria-current', 'location');
                centerMobileLink(anchor);
            } else {
                anchor.removeAttribute('aria-current');
            }
        });
    };

    const measureSections = () => {
        const scrollTop = window.scrollY;
        sectionPositions = records.map(record => ({
            ...record,
            top: record.section.getBoundingClientRect().top + scrollTop
        }));
    };

    const syncFromScroll = (scrollPosition, measuredVelocity = 0) => {
        const readingLine = scrollPosition + window.innerHeight * 0.43;
        let activeRecord = sectionPositions[0] || records[0];

        sectionPositions.forEach(record => {
            if (record.top <= readingLine) activeRecord = record;
        });

        setActiveScene(activeRecord.id);

        const now = performance.now();
        const scrollDelta = scrollPosition - lastScroll;
        const timeDelta = Math.max(1, now - lastScrollAt);

        if (Math.abs(scrollDelta) > 0.5) {
            const derivedVelocity = scrollDelta / timeDelta * 1000;
            const velocity = Math.abs(measuredVelocity) >= 6
                ? measuredVelocity
                : derivedVelocity;
            characterJourney.move(velocity);
        }

        lastScroll = scrollPosition;
        lastScrollAt = now;
    };

    navAnchors.forEach(anchor => {
        anchor.addEventListener('click', event => {
            const href = anchor.getAttribute('href');
            const target = href?.startsWith('#') ? document.querySelector(href) : null;
            if (!target) return;

            event.preventDefault();
            setActiveScene(target.id);
            const targetTop = target.getBoundingClientRect().top + window.scrollY;
            characterJourney.move(targetTop >= window.scrollY ? 900 : -900);
            target.scrollIntoView({
                behavior: reducedMotion ? 'auto' : 'smooth',
                block: 'start'
            });
            window.history.pushState(null, '', href);
        });
    });

    measureSections();
    syncFromScroll(window.scrollY);

    document.addEventListener('click', event => {
        if (event.defaultPrevented || event.detail === 0) return;

        const target = event.target instanceof Element ? event.target : null;
        if (!target || target.closest(
            'a, button, input, textarea, select, summary, label, ' +
            '[role="button"], [contenteditable="true"]'
        )) return;

        characterJourney.interact();
    });

    if (window.ScrollTrigger) {
        window.ScrollTrigger.create({
            id: 'journey-state',
            start: 0,
            end: 'max',
            onRefresh: () => {
                measureSections();
                syncFromScroll(window.scrollY);
            },
            onUpdate: self => syncFromScroll(self.scroll(), self.getVelocity())
        });
        return;
    }

    let frame = 0;
    const scheduleSync = () => {
        if (frame) return;
        frame = window.requestAnimationFrame(() => {
            frame = 0;
            syncFromScroll(window.scrollY);
        });
    };

    window.addEventListener('scroll', scheduleSync, { passive: true });
    window.addEventListener('resize', () => {
        measureSections();
        scheduleSync();
    });
}

function initScrollMotion() {
    if (!window.gsap || !window.ScrollTrigger) return;

    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    const stage = document.querySelector('.traveler-stage');
    const sceneTrack = document.querySelector('.scene-track');
    const traveler = document.querySelector('.traveler-scale');
    const profileCard = document.querySelector('.profile-card');
    const main = document.querySelector('#main-content');
    const about = document.querySelector('#about');
    const research = document.querySelector('#research');
    const publications = document.querySelector('#publications');
    const services = document.querySelector('#services');
    const sceneSections = [
        '#about',
        '#research',
        '#news',
        '#publications',
        '#github-repos',
        '#education',
        '#services'
    ]
        .map(selector => document.querySelector(selector))
        .filter(Boolean);

    if (
        !stage ||
        !sceneTrack ||
        !traveler ||
        !profileCard ||
        !main ||
        !about ||
        !research ||
        !publications ||
        !services
    ) return;

    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();

    media.add({
        desktop: '(min-width: 821px)',
        mobile: '(max-width: 820px)',
        reduceMotion: '(prefers-reduced-motion: reduce)'
    }, context => {
        const { desktop, reduceMotion } = context.conditions;
        if (reduceMotion) return undefined;
        let scenePanTo;

        gsap.set(traveler, {
            scale: desktop ? 1.1 : 1,
            x: 0,
            y: 0,
            transformOrigin: desktop ? '20% 100%' : '50% 100%'
        });

        if (desktop) {
            gsap.set(stage, { clipPath: 'inset(0 0% 0 0)' });
            gsap.set(sceneTrack, { xPercent: 0 });
            gsap.set(profileCard, {
                x: 0,
                y: 0,
                scale: 1,
                transformOrigin: '0 0'
            });

            gsap.to(profileCard, {
                x: () => 20 - Number.parseFloat(window.getComputedStyle(profileCard).left),
                y: () => {
                    const navHeight = Number.parseFloat(
                        window.getComputedStyle(document.documentElement)
                            .getPropertyValue('--nav-height')
                    );
                    return navHeight + 24 - Number.parseFloat(window.getComputedStyle(profileCard).top);
                },
                scale: () => {
                    const contentLeft = document.querySelector('.content-right')
                        ?.getBoundingClientRect().left ?? window.innerWidth;
                    const availableWidth = Math.max(0, contentLeft - 40);
                    return Math.min(0.9, Math.max(0.58, availableWidth / profileCard.offsetWidth));
                },
                ease: 'none',
                scrollTrigger: {
                    id: 'profile-dock',
                    trigger: main,
                    endTrigger: research,
                    start: 'top top',
                    end: 'top 58%',
                    scrub: 0.72,
                    invalidateOnRefresh: true
                }
            });

            gsap.to(stage, {
                clipPath: () => {
                    const contentLeft = document.querySelector('.content-right')
                        ?.getBoundingClientRect().left ?? stage.offsetWidth;
                    const insetRight = Math.max(0, stage.offsetWidth - contentLeft);
                    return `inset(0 ${insetRight}px 0 0)`;
                },
                ease: 'none',
                scrollTrigger: {
                    id: 'stage-narrow',
                    trigger: main,
                    endTrigger: publications,
                    start: 'top top',
                    end: 'top 48%',
                    scrub: 0.8,
                    invalidateOnRefresh: true
                }
            });

            const sceneStep = 100 / sceneSections.length;
            let sceneAnchors = [];

            scenePanTo = gsap.quickTo(sceneTrack, 'xPercent', {
                duration: 0.52,
                ease: 'power3.out'
            });

            const measureSceneAnchors = () => {
                sceneAnchors = sceneSections.map((section, index) => (
                    index === 0
                        ? 0
                        : Math.max(0, section.offsetTop - window.innerHeight * 0.52)
                ));
            };

            const syncScenePan = scrollPosition => {
                let sceneIndex = 0;

                while (
                    sceneIndex < sceneAnchors.length - 1 &&
                    scrollPosition >= sceneAnchors[sceneIndex + 1]
                ) {
                    sceneIndex += 1;
                }

                const nextIndex = Math.min(sceneIndex + 1, sceneAnchors.length - 1);
                const segmentStart = sceneAnchors[sceneIndex] ?? 0;
                const segmentEnd = sceneAnchors[nextIndex] ?? segmentStart;
                const segmentProgress = segmentEnd > segmentStart
                    ? Math.min(1, Math.max(0, (scrollPosition - segmentStart) / (segmentEnd - segmentStart)))
                    : 0;

                scenePanTo(-(sceneStep * (sceneIndex + segmentProgress)));
            };

            ScrollTrigger.create({
                id: 'scene-pan',
                start: 0,
                end: 'max',
                onRefresh: self => {
                    measureSceneAnchors();
                    syncScenePan(self.scroll());
                },
                onUpdate: self => syncScenePan(self.scroll())
            });

            measureSceneAnchors();
            syncScenePan(window.scrollY);
        }

        gsap.to(traveler, {
            scale: desktop ? 0.7 : 0.72,
            y: desktop ? 46 : 0,
            ease: 'none',
            scrollTrigger: {
                id: 'traveler-scale',
                trigger: main,
                endTrigger: publications,
                start: 'top top',
                end: 'top 46%',
                scrub: 0.65,
                invalidateOnRefresh: true
            }
        });

        gsap.to(traveler, {
            x: desktop ? 48 : -8,
            ease: 'none',
            scrollTrigger: {
                id: 'traveler-travel',
                trigger: main,
                endTrigger: services,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 0.8,
                invalidateOnRefresh: true
            }
        });

        if (desktop) {
            gsap.to('.cloud-a', {
                x: 54,
                ease: 'none',
                scrollTrigger: {
                    id: 'cloud-a-drift',
                    trigger: main,
                    endTrigger: services,
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: 1.2
                }
            });

            gsap.to('.cloud-b', {
                x: -36,
                ease: 'none',
                scrollTrigger: {
                    id: 'cloud-b-drift',
                    trigger: main,
                    endTrigger: services,
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: 1.4
                }
            });
        }

        return () => {
            scenePanTo?.tween?.kill();
        };
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    document.documentElement.setAttribute('data-theme', 'light');
    const config = await loadConfig();
    renderProfile(config);
    renderNavigation(config);
    renderSocialLinks(config);
    setFooterDate();
    await loadAndRenderGitHubRepos();
    externalizeLinks();

    if (window.gsap && window.ScrollTrigger) {
        window.gsap.registerPlugin(window.ScrollTrigger);
    }

    initJourneyState();
    initScrollMotion();

    window.addEventListener('load', () => {
        window.ScrollTrigger?.refresh();
    }, { once: true });
});
