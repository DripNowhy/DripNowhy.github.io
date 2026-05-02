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
        a.textContent = link.title;
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

function initPageMotion() {
    const navbar = document.querySelector('.navbar');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const updateNavbar = () => {
        if (!navbar) return;
        navbar.classList.toggle('scrolled', window.scrollY > 8);
    };

    updateNavbar();
    window.addEventListener('scroll', updateNavbar, { passive: true });

    const sections = Array.from(document.querySelectorAll('.section'));
    if (prefersReducedMotion) {
        sections.forEach(section => section.classList.add('section-visible'));
        return;
    }

    document.body.classList.add('motion-ready');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('section-visible');
            } else {
                entry.target.classList.remove('section-visible');
            }
        });
    }, {
        rootMargin: '0px 0px -12% 0px',
        threshold: 0.08
    });

    sections.forEach((section, index) => {
        section.style.setProperty('--section-delay', `${Math.min(index * 45, 180)}ms`);
        observer.observe(section);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    await initializeNavigation();
    await initializeContent();

    document.body.style.overflow = 'auto';
    document.getElementById('main-content')?.classList.add('visible');
    initPageMotion();

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
