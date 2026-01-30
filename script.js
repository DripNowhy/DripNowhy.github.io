// 加载YAML配置
async function loadConfig() {
    try {
        console.log("开始加载配置文件...");
        const response = await fetch('config.yml');
        if (!response.ok) {
            throw new Error('config.yml fetch failed: ' + response.status);
        }
        const yamlText = await response.text();
        console.log("配置文件加载成功，开始解析...");
        return jsyaml.load(yamlText);
    } catch (error) {
        console.error('配置文件加载失败:', error);
        if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
            alert('无法加载配置文件。请确保您正在使用本地服务器运行网站，而不是直接打开HTML文件。\n\n建议使用以下方法之一：\n1. 使用 Python 运行: python -m http.server\n2. 使用 Node.js 运行: npx http-server');
        } else {
            alert('配置文件加载失败：' + error.message);
        }
        return null;
    }
}

// 初始化页面内容 - 简化版本，因为内容已经静态嵌入到HTML中
async function initializeContent() {
    console.log('页面内容已静态嵌入到HTML中，无需动态加载');

    // 只保留必要的初始化逻辑
    await initializeNavigation();
    await loadAndRenderGitHubRepos();

    // 设置页脚更新日期 - 每天更新
    updateFooterDate();
    // 每天检查一次更新
    setInterval(updateFooterDate, 24 * 60 * 60 * 1000);
}

// 更新页脚日期函数
function updateFooterDate() {
    const footerUpdateDate = document.getElementById('footer-update-date');
    if (footerUpdateDate) {
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        footerUpdateDate.textContent = dateStr;
        console.log('Footer date updated:', dateStr);
    }
}

// 主题切换相关
const themes = ['auto', 'light', 'dark'];
let currentThemeIndex = 0;

let mediaQueryDark = window.matchMedia('(prefers-color-scheme: dark)');
let autoThemeListener = null;

function setTheme(theme) {
    const html = document.documentElement;
    if (theme === 'auto') {
        // Re-detect based on local timezone
        detectTimezoneAndSetTheme();
        // Set up interval to check time periodically
        if (!window.themeCheckInterval) {
            window.themeCheckInterval = setInterval(detectTimezoneAndSetTheme, 60000); // Check every minute
        }
    } else {
        html.setAttribute('data-theme', theme);
        // Clear auto-check interval
        if (window.themeCheckInterval) {
            clearInterval(window.themeCheckInterval);
            window.themeCheckInterval = null;
        }
    }
    localStorage.setItem('theme', theme);
}

function updateThemeBtnIcon() {
    const themeBtn = document.querySelector('.theme-btn');
    if (!themeBtn) return;
    const icon = themeBtn.querySelector('i');
    if (!icon) return;
    // 切换图标
    icon.className = 'fas ' + (
        themes[currentThemeIndex] === 'auto' ? 'fa-circle-half-stroke' :
        themes[currentThemeIndex] === 'light' ? 'fa-sun' :
        'fa-moon'
    );
    // Get current theme status
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const currentMode = isDark ? 'Dark' : 'Light';
    themeBtn.title = 'Theme: ' + (
        themes[currentThemeIndex] === 'auto' ? `Auto (${currentMode})` :
        themes[currentThemeIndex] === 'light' ? 'Light' : 'Dark'
    );
}

function handleThemeBtnClick() {
    currentThemeIndex = (currentThemeIndex + 1) % themes.length;
    setTheme(themes[currentThemeIndex]);
    updateThemeBtnIcon();
}

// Auto-detect timezone and set theme based on local time
function detectTimezoneAndSetTheme() {
    const now = new Date();
    const hour = now.getHours();
    // 6am - 6pm = light mode, 6pm - 6am = dark mode
    const isDaytime = hour >= 6 && hour < 18;

    if (isDaytime) {
        document.documentElement.removeAttribute('data-theme');
        console.log('Auto theme: Light mode (daytime:', hour + ':00)');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        console.log('Auto theme: Dark mode (nighttime:', hour + ':00)');
    }
}

// 页面加载时应用主题
const savedTheme = localStorage.getItem('theme');
if (savedTheme && savedTheme !== 'auto') {
    // User has manually selected a theme preference
    currentThemeIndex = themes.indexOf(savedTheme);
    if (currentThemeIndex === -1) currentThemeIndex = 0;
    setTheme(themes[currentThemeIndex]);
} else {
    // Auto-detect based on timezone
    currentThemeIndex = 0; // auto mode
    detectTimezoneAndSetTheme();
    localStorage.setItem('theme', 'auto');
}

// 初始化导航链接
async function initializeNavigation() {
    const config = await loadConfig();
    console.log('config:', config);
    if (!config) return;

    // 更新个人信息
    const profileInfo = document.querySelector('.profile-info');
    if (profileInfo) {
        profileInfo.querySelector('h2').textContent = config.profile.name;
        profileInfo.querySelector('.title').textContent = config.profile.title;
        profileInfo.querySelector('.department').textContent = config.profile.department;
        profileInfo.querySelector('.university').textContent = config.profile.university;
    }

    // 更新个人照片
    const profileImage = document.querySelector('.profile-image img');
    if (profileImage) {
        profileImage.src = config.profile.image;
        profileImage.alt = config.profile.name;
    }

    // 更新导航链接
    const navLinks = document.querySelector('.nav-links');
    const sidebarSocialLinks = document.querySelector('.sidebar-left .social-links');

    // 清空现有链接
    navLinks.innerHTML = '';
    if (sidebarSocialLinks) sidebarSocialLinks.innerHTML = '';

    // 添加导航链接
    Object.values(config.navigation).forEach(link => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = link.url;
        a.innerHTML = `<i class="${link.icon}"></i> ${link.title}`;
        li.appendChild(a);
        navLinks.appendChild(li);
    });

    // 添加主题切换按钮
    const themeLi = document.createElement('li');
    themeLi.className = 'theme-btn-wrapper';
    themeLi.innerHTML = `
        <button class="theme-btn" title="Toggle Theme">
            <i class="fas fa-circle-half-stroke"></i>
        </button>
    `;
    navLinks.appendChild(themeLi);

    // 添加侧边栏社交媒体链接
    if (sidebarSocialLinks) {
        Object.values(config.social).forEach(link => {
            const a = document.createElement('a');
            a.href = link.url;
            a.title = link.title;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.innerHTML = `<i class="${link.icon}"></i>`;
            sidebarSocialLinks.appendChild(a);
        });
    }

    // 添加hero section社交媒体链接（大按钮带图标）
    const heroSocial = document.querySelector('.hero-social');
    if (heroSocial) {
        heroSocial.innerHTML = '';
        Object.values(config.social).forEach(link => {
            const a = document.createElement('a');
            a.href = link.url;
            a.title = link.title;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';

            a.innerHTML = `<i class="${link.icon}"></i>`;
            heroSocial.appendChild(a);
        });
    }

    setAllLinksBlank();
}

// 获取并渲染 GitHub 仓库
async function loadAndRenderGitHubRepos() {
    const username = 'DripNowhy';
    const repoSection = document.querySelector('.github-repo-section');
    if (!repoSection) return;
    repoSection.innerHTML = '<p>Loading repositories...</p>';
    try {
        const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);
        if (!res.ok) throw new Error('GitHub API error');
        const repos = await res.json();
        if (!Array.isArray(repos)) throw new Error('Invalid repo data');
        // 只显示非 fork 的公开仓库，按 star 数排序，只取前三个
        const filtered = repos.filter(r => !r.fork).sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 3);
        if (filtered.length === 0) {
            repoSection.innerHTML = '<p>No public repositories found.</p>';
            return;
        }
        repoSection.innerHTML = `<div class="github-repo-grid">${filtered.map(repo => `
            <div class="github-repo-card">
                <div class="repo-title"><a href="${repo.html_url}" target="_blank"><i class="fas fa-book"></i> ${repo.name}</a></div>
                <div class="repo-desc">${repo.description ? repo.description : ''}</div>
                <div class="repo-meta">
                    ${repo.language ? `<span class="repo-lang"><span class="repo-dot"></span>${repo.language}</span>` : ''}
                    <span class="repo-stars"><i class="fas fa-star"></i> ${repo.stargazers_count}</span>
                    <span class="repo-forks"><i class="fas fa-code-branch"></i> ${repo.forks_count}</span>
                </div>
            </div>
        `).join('')}</div>`;
    } catch (e) {
        repoSection.innerHTML = '<p>Failed to load repositories.</p>';
    }

    setAllLinksBlank();
}

function setAllLinksBlank() {
    document.querySelectorAll('a').forEach(a => {
        const href = a.getAttribute('href');
        if (href && !href.startsWith('#') && !a.hasAttribute('target')) {
            a.setAttribute('target', '_blank');
            a.setAttribute('rel', 'noopener noreferrer');
        } else if (href && href.startsWith('#')) {
            a.removeAttribute('target');
            a.removeAttribute('rel');
        }
    });
}

// Text Scramble Effect - First load only with special chars
class TextScramble {
    constructor(el) {
        this.el = el;
        // Special characters for cool effect
        this.chars = '!<>-_\\/[]{}—=+*^?#%&';
        this.update = this.update.bind(this);
    }

    setText(newText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => this.resolve = resolve);

        this.queue = [];
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            // Shorter animation duration
            const start = Math.floor(Math.random() * 15);
            const end = start + Math.floor(Math.random() * 15) + 10;
            this.queue.push({ from, to, start, end });
        }

        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
    }

    update() {
        let output = '';
        let complete = 0;

        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];

            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                // Less random changes - only 15% chance to change char
                if (!char || Math.random() < 0.15) {
                    char = this.chars[Math.floor(Math.random() * this.chars.length)];
                    this.queue[i].char = char;
                }
                output += `<span class="scramble-char">${char}</span>`;
            } else {
                output += from;
            }
        }

        this.el.innerHTML = output;

        if (complete === this.queue.length) {
            this.resolve();
        } else {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }
}

// Apply scramble effect to headers only
function initTextScramble() {
    // Only headers get the scramble effect
    const headers = document.querySelectorAll('.section-header h2, .profile-info h2');

    headers.forEach((header, index) => {
        const originalText = header.innerText;
        const fx = new TextScramble(header);

        // Delay based on index for staggered effect
        setTimeout(() => {
            fx.setText(originalText);
        }, index * 150);
    });
}

// Scroll Animation - Always animate on scroll with lower threshold
function initScrollAnimations() {
    const sections = document.querySelectorAll('.section');

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.05
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add visible class for animation
                entry.target.classList.add('section-visible');
            } else {
                // Remove visible class when out of view
                entry.target.classList.remove('section-visible');
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });
}

// Handwriting Effect - "DripNowhy" appears randomly on hero section
class HandwritingEffect {
    constructor() {
        this.canvas = document.getElementById('handwriting-canvas');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.signatures = [];
        this.isActive = true;

        // Multiple handwriting fonts to choose from
        this.fonts = [
            'Caveat',
            'Dancing Script',
            'Pacifico',
            'Great Vibes',
            'Satisfy',
            'Kalam'
        ];

        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Start generating signatures
        this.generateSignature();
        // Generate new ones frequently for overlapping effect
        this.interval = setInterval(() => {
            if (this.isActive) {
                this.generateSignature();
            }
        }, 600);

        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    generateSignature() {
        const text = 'DripNowhy';

        // Try to find a position that doesn't overlap too much
        let x, y, fontSize, rotation;
        let attempts = 0;
        const maxAttempts = 50;

        do {
            x = Math.random() * this.canvas.width;
            y = Math.random() * this.canvas.height;
            fontSize = Math.random() * 100 + 20;
            rotation = (Math.random() - 0.5) * 1.6;
            attempts++;
        } while (this.checkOverlap(x, y, fontSize, text) && attempts < maxAttempts);

        // Random color based on current theme with more variation
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        // Wider opacity range for layering effect
        const alpha = Math.random() * 0.4 + 0.1;
        // Multiple color options for variety
        const darkColors = [
            `rgba(167, 139, 250, ${alpha})`,
            `rgba(192, 132, 252, ${alpha})`,
            `rgba(139, 92, 246, ${alpha})`,
            `rgba(124, 58, 237, ${alpha})`,
        ];
        const lightColors = [
            `rgba(99, 102, 241, ${alpha})`,
            `rgba(129, 140, 248, ${alpha})`,
            `rgba(79, 70, 229, ${alpha})`,
            `rgba(67, 56, 202, ${alpha})`,
        ];
        const color = isDark
            ? darkColors[Math.floor(Math.random() * darkColors.length)]
            : lightColors[Math.floor(Math.random() * lightColors.length)];

        // Random font from the list
        const font = this.fonts[Math.floor(Math.random() * this.fonts.length)];

        this.signatures.push({
            text,
            x,
            y,
            fontSize,
            rotation,
            color,
            font,
            progress: 0,
            speed: Math.random() * 0.03 + 0.02,
            finished: false
        });

        // Keep more signatures for dense overlapping effect
        if (this.signatures.length > 30) {
            this.signatures.shift();
        }
    }

    // Check if new signature would overlap too much with existing ones
    checkOverlap(x, y, fontSize, text) {
        const minDistance = fontSize * 1.5; // Minimum distance based on font size

        for (const sig of this.signatures) {
            const dx = x - sig.x;
            const dy = y - sig.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < minDistance) {
                return true; // Too close, would overlap
            }
        }
        return false; // Safe position
    }

    animate() {
        if (!this.isActive) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.signatures.forEach(sig => {
            this.ctx.save();
            this.ctx.translate(sig.x, sig.y);
            this.ctx.rotate(sig.rotation);

            // Set font style - use the signature's randomly selected font
            const fontWeight = Math.random() > 0.5 ? '500' : '700';
            this.ctx.font = `${fontWeight} ${sig.fontSize}px '${sig.font}', cursive`;
            this.ctx.fillStyle = sig.color;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';

            // Draw partial text based on progress
            const length = sig.text.length;
            const charsToShow = Math.floor(sig.progress * length);
            const partialText = sig.text.substring(0, charsToShow);

            if (partialText.length > 0) {
                this.ctx.fillText(partialText, 0, 0);
            }

            this.ctx.restore();

            // Update progress
            if (!sig.finished) {
                sig.progress += sig.speed;
                if (sig.progress >= 1) {
                    sig.progress = 1;
                    sig.finished = true;
                }
            }
        });

        requestAnimationFrame(() => this.animate());
    }

    stop() {
        this.isActive = false;
        clearInterval(this.interval);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.signatures = [];
    }
}

// Hero scroll effect - hide hero and show main content on scroll
function initHeroScroll() {
    const hero = document.getElementById('hero');
    const mainContent = document.getElementById('main-content');
    const navbar = document.querySelector('.navbar');
    const scrollHint = document.querySelector('.scroll-hint');

    // Initialize handwriting effect
    const handwritingEffect = new HandwritingEffect();

    if (!hero || !mainContent) return;

    // Initially hide navbar
    if (navbar) {
        navbar.style.opacity = '0';
        navbar.style.transition = 'opacity 0.5s ease';
    }

    let lastScrollY = 0;
    let heroHidden = false;
    let userScrolled = false;

    // Auto-scroll hint after 3 seconds if user hasn't scrolled
    setTimeout(() => {
        if (!userScrolled && !heroHidden) {
            // Gentle auto-scroll hint
            window.scrollTo({
                top: window.innerHeight * 0.15,
                behavior: 'smooth'
            });
            // Scroll back up after a moment
            setTimeout(() => {
                if (!userScrolled && !heroHidden) {
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                }
            }, 600);
        }
    }, 3000);

    // Mark that user has scrolled
    window.addEventListener('scroll', () => {
        userScrolled = true;
    }, { passive: true, once: true });

    // Click scroll hint to scroll down
    if (scrollHint) {
        scrollHint.addEventListener('click', () => {
            window.scrollTo({
                top: window.innerHeight,
                behavior: 'smooth'
            });
        });
    }

    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;
        const heroHeight = hero.offsetHeight;
        const scrollPercent = scrollY / heroHeight;

        // Show navbar after scrolling a bit
        if (navbar && scrollY > 100) {
            navbar.style.opacity = '1';
        } else if (navbar) {
            navbar.style.opacity = '0';
        }

        // Hide hero and show main content after scrolling past 30% of hero
        if (scrollPercent > 0.3 && !heroHidden) {
            hero.classList.add('hidden');
            mainContent.classList.add('visible');
            document.body.style.overflow = 'auto';
            heroHidden = true;
            // Stop handwriting effect
            if (handwritingEffect) {
                handwritingEffect.stop();
            }
            // Start text scramble effect when entering main content
            initTextScramble();
        }

        lastScrollY = scrollY;
    }, { passive: true });

    // Handle wheel event for smoother transition
    window.addEventListener('wheel', (e) => {
        if (!heroHidden && e.deltaY > 0) {
            hero.classList.add('hidden');
            mainContent.classList.add('visible');
            if (navbar) navbar.style.opacity = '1';
            document.body.style.overflow = 'auto';
            heroHidden = true;
            // Stop handwriting effect
            if (handwritingEffect) {
                handwritingEffect.stop();
            }
            // Start text scramble effect when entering main content
            initTextScramble();
        }
    }, { passive: true });

    // Prevent scrolling initially
    document.body.style.overflow = 'hidden';
}

document.addEventListener('DOMContentLoaded', async () => {
    await initializeNavigation();
    await initializeContent();

    // Initialize hero scroll and animations
    initHeroScroll();
    initScrollAnimations();

    // 绑定主题按钮事件
    const themeBtn = document.querySelector('.theme-btn');
    if (themeBtn) {
        themeBtn.addEventListener('click', handleThemeBtnClick);
        updateThemeBtnIcon();
    }

    // Start auto timezone detection if in auto mode
    if (currentThemeIndex === 0) {
        window.themeCheckInterval = setInterval(detectTimezoneAndSetTheme, 60000);
    }
});
