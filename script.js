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

// 加载内容
async function loadContent() {
    // 检查 jsyaml 库是否已加载
    if (typeof jsyaml === 'undefined') {
        console.error('CRITICAL: js-yaml library (jsyaml) is not loaded.');
        alert('js-yaml 库未加载，请检查网络连接或刷新页面重试。');
        return null;
    }

    try {
        console.log("开始加载 content.md...");
        const response = await fetch('content.md');

        if (!response.ok) {
            throw new Error('content.md fetch failed: ' + response.status);
        }
        console.log("成功获取 content.md 内容");
        const markdownText = await response.text();
        console.log("content.md 内容长度:", markdownText.length);

        const sections = {};
        const yamlBlocks = markdownText.match(/```yaml\n([\s\S]*?)\n```/g);

        if (yamlBlocks && yamlBlocks.length > 0) {
            console.log(`在 content.md 中找到 ${yamlBlocks.length} 个 YAML 块`);
            for (const block of yamlBlocks) {
                const yamlContent = block.replace(/```yaml\n/, '').replace(/\n```/, '');
                console.log("正在解析 YAML 块，内容前100个字符:", yamlContent.substring(0, 100) + "...");
                try {
                    const sectionData = jsyaml.load(yamlContent);
                    console.log("YAML 块解析成功:", Object.keys(sectionData));
                    Object.assign(sections, sectionData);
                } catch (yamlError) {
                    console.error("YAML 解析错误:", yamlError);
                    console.error("问题 YAML 内容:", yamlContent);
                }
            }
            console.log("所有 YAML 块解析完成，最终 sections 对象:", Object.keys(sections));
        } else {
            console.warn('在 content.md 中未找到 YAML 块');
        }
        
        return sections;
    } catch (error) {
        console.error('加载内容时出错:', error);
        alert('内容文件加载失败：' + error.message);
        return null;
    }
}

// 初始化页面内容
async function initializeContent() {
    const content = await loadContent();
    console.log('content:', content);
    
    if (!content) {
        console.error("Failed to load content from content.md. Page will not be fully populated.");
        // Try to inform the user on the page itself for critical sections
        const aboutSectionContent = document.querySelector('#about .section-content');
        if (aboutSectionContent) aboutSectionContent.innerHTML = "<p>Error: Could not load page content.</p>";
        
        const researchSection = document.querySelector('.research-section');
        if (researchSection) researchSection.innerHTML = "<p>Error: Could not load research data.</p>";
        // Add similar fallbacks for other sections if desired
        return;
    }

    // 更新关于我
    if (content.about && content.about.content) {
        const aboutContent = document.querySelector('#about .section-content');
        if (aboutContent) {
            aboutContent.innerHTML = content.about.content
                .split('\n').map(line => `<p>${line.trim()}</p>`).join('');
        } else {
            console.warn('#about .section-content not found');
        }
    } else {
        console.warn('content.about or content.about.content is missing');
        const aboutContent = document.querySelector('#about .section-content');
        if (aboutContent) aboutContent.innerHTML = "<p>About me data is unavailable.</p>";
    }

    // 更新研究兴趣
    const researchSection = document.querySelector('.research-section');
    if (!researchSection) {
        console.error('.research-section element not found in DOM!');
    } else {
        if (content.research) {
            console.log('Loaded research content (raw):', JSON.stringify(content.research, null, 2));
            if (content.research.items && Array.isArray(content.research.items) && content.research.items.length > 0) {
                let html = '<ul class="research-list">';
                content.research.items.forEach(item => {
                    const keyword = item.keyword || "N/A";
                    const description = item.description || "No description provided.";
                    html += `<li><span class="interest-keyword">${keyword}:</span> ${description}</li>`;
                });
                html += '</ul>';
                
                const invite = content.research.invite || "";

                if (invite) {
                    html += `<div class="collab-invite">${invite}</div>`;
                }
                researchSection.innerHTML = html;
                console.log('Research section populated successfully.');
            } else {
                console.warn('content.research.items is missing, not a non-empty array, or undefined.');
                if (content.research.hasOwnProperty('items')) {
                     console.log('content.research.items value:', content.research.items);
                }
                researchSection.innerHTML = '<p>Research interests are currently being updated or are unavailable.</p>';
            }
        } else {
            console.warn('content.research data is missing from loaded content.');
            researchSection.innerHTML = '<p>Could not load research interests data.</p>';
        }
    }

    // 更新新闻
    if (content.news) {
        const newsContent = document.querySelector('#news .section-content');
        if (newsContent && content.news.items && Array.isArray(content.news.items)) {
            newsContent.innerHTML = `
                <div class="news-container">
                    ${content.news.items.map(item => `
                        <div class="news-item">
                            <span class="date">${item.date || "No Date"}</span>
                            <p>${item.content || "No Content"}</p>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            console.warn('content.news.items is missing or not an array.');
            if (newsContent) newsContent.innerHTML = '<p>News items are currently unavailable.</p>';
        }
    }

    // 更新发表论文
    if (content.publications) {
        console.log("开始处理 publications 部分");
        const publicationsContent = document.querySelector('#publications .section-content');
        console.log("找到 publications 容器:", !!publicationsContent);
        
        if (publicationsContent && content.publications.items && Array.isArray(content.publications.items)) {
            console.log("Publications 数据:", content.publications.items);
            try {
                publicationsContent.innerHTML = content.publications.items.map(item => {
                    // 高亮作者名 Yi Ding
                    let authors = item.authors || "";
                    authors = authors.replace(/Yi Ding/g, '<span class="highlight-name">Yi Ding</span>');
                    // 处理可选Project链接
                    let projectLink = '';
                    if (item.links && item.links.project) {
                        projectLink = `<a href="${item.links.project}" class="pub-link"><i class="fas fa-globe"></i> Project</a>`;
                    }
                    return `
                    <div class="publication-item">
                        <div class="pub-image-block">
                            <div class="pub-venue-badge">${item.venue || ''}</div>
                            <img class="pub-image" src="${item.image || ''}" alt="${item.title || ''}">
                        </div>
                        <div class="pub-content">
                            <h3>${item.title || "No Title"}</h3>
                            <p class="authors">${authors}</p>
                            ${item.tldr ? `<div class="pub-tldr"><span class="pub-tldr-label">TL;DR:</span> ${item.tldr}</div>` : ''}
                            <p class="journal">${item.journal || ""}</p>
                            <div class="pub-links">
                                ${(item.links && item.links.paper) ? `<a href="${item.links.paper}" class="pub-link"><i class="fas fa-file-alt"></i> Paper</a>` : ''}
                                ${(item.links && item.links.code) ? `<a href="${item.links.code}" class="pub-link"><i class="fab fa-github"></i> Code</a>` : ''}
                                ${projectLink}
                            </div>
                        </div>
                    </div>
                    `;
                }).join('');
                console.log("Publications HTML 更新成功");
            } catch (error) {
                console.error("生成 publications HTML 时出错:", error);
                publicationsContent.innerHTML = '<p>生成出版物列表时出错。</p>';
            }
        } else {
            console.warn('Publications 数据不完整:', {
                hasContent: !!content.publications,
                hasItems: !!(content.publications && content.publications.items),
                isArray: !!(content.publications && content.publications.items && Array.isArray(content.publications.items))
            });
            if (publicationsContent) publicationsContent.innerHTML = '<p>Publications list is currently unavailable.</p>';
        }
    }

    // 更新教育经历
    if (content.education) {
        const educationContent = document.querySelector('#education .section-content');
        if (educationContent && content.education.items && Array.isArray(content.education.items)) {
            educationContent.innerHTML = content.education.items.map(item => {
                // 学位+专业
                const degreeMajor = `${item.degree || ''}${item.school ? ' in ' + item.school : ''}`;
                // 学校logo
                const logoImg = item.school_logo ? `<img class='school-logo' src='${item.school_logo}' alt='logo'/>` : '';
                // advisor
                let advisorHtml = '';
                if (item.advisor && item.advisor.name) {
                    if (item.advisor.url) {
                        advisorHtml = `<p class="advisor">Advisor: <a href='${item.advisor.url}' target='_blank'>${item.advisor.name}</a></p>`;
                    } else {
                        advisorHtml = `<p class="advisor">Advisor: ${item.advisor.name}</p>`;
                    }
                }
                return `
                <div class="education-item">
                    <div class="edu-content">
                        <h3>${degreeMajor} ${logoImg}</h3>
                        ${advisorHtml}
                    </div>
                    <div class="edu-period">${item.period || ""}</div>
                </div>
                `;
            }).join('');
        } else {
            console.warn('content.education.items is missing or not an array.');
            if (educationContent) educationContent.innerHTML = '<p>Education history is currently unavailable.</p>';
        }
    }

    // 更新服务
    if (content.services) {
        const servicesContent = document.querySelector('#services .section-content');
        if (servicesContent && content.services.items && Array.isArray(content.services.items)) {
            servicesContent.innerHTML = content.services.items.map(item => `
                <div class="service-item">
                    <span class="service-role">${item.role || ''}:</span>
                    <span class="service-venue">${item.venue || ''}</span>
                </div>
            `).join('');
        } else {
            console.warn('content.services.items is missing or not an array.');
            if (servicesContent) servicesContent.innerHTML = '<p>Services information is currently unavailable.</p>';
        }
    }

    // 更新联系方式
    if (content.contact) {
        const contactGrid = document.querySelector('.contact-grid');
        if (contactGrid && content.contact.items && Array.isArray(content.contact.items)) {
            contactGrid.innerHTML = content.contact.items.map(item => {
                if (item.type === 'location') {
                    // 支持多行和时钟
                    const lines = item.content.split(/\\n|\n/);
                    const clocks = [
                        '<span class="contact-clock" id="clock-beijing"></span>',
                        '<span class="contact-clock" id="clock-indiana"></span>'
                    ];
                    return `
                        <div class="contact-item">
                            <i class="${item.icon || ''}"></i>
                            <div>
                                <div>${lines[0]} ${clocks[0]}</div>
                                <div>${lines[1] ? lines[1] + ' ' + clocks[1] : ''}</div>
                            </div>
                        </div>
                    `;
                } else {
                    return `
                        <div class="contact-item">
                            <i class="${item.icon || ''}"></i>
                            <p>${item.content || ''}</p>
                        </div>
                    `;
                }
            }).join('');
            // 启动时钟
            function updateClocks() {
                // 北京时间（东八区）
                const beijing = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Shanghai' });
                // 印第安纳时间（美东时间）
                const indiana = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Indiana/Indianapolis' });
                const el1 = document.getElementById('clock-beijing');
                const el2 = document.getElementById('clock-indiana');
                if (el1) el1.textContent = `🕒 ${beijing}`;
                if (el2) el2.textContent = `🕒 ${indiana}`;
            }
            updateClocks();
            setInterval(updateClocks, 10000);
        } else {
            console.warn('content.contact.items is missing or not an array.');
            if (contactGrid) contactGrid.innerHTML = '<p>Contact information is currently unavailable.</p>';
        }
    }

    setAllLinksBlank();
}

// 主题切换相关
const themes = ['auto', 'light', 'dark'];
let currentThemeIndex = 0;

let mediaQueryDark = window.matchMedia('(prefers-color-scheme: dark)');
let autoThemeListener = null;

function setTheme(theme) {
    const html = document.documentElement;
    if (theme === 'auto') {
        html.removeAttribute('data-theme');
        // 监听系统主题变化
        if (!autoThemeListener) {
            autoThemeListener = (e) => {
                html.removeAttribute('data-theme');
            };
            mediaQueryDark.addEventListener('change', autoThemeListener);
        }
    } else {
        html.setAttribute('data-theme', theme);
        // 移除监听
        if (autoThemeListener) {
            mediaQueryDark.removeEventListener('change', autoThemeListener);
            autoThemeListener = null;
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
    themeBtn.title = '当前主题: ' + (
        themes[currentThemeIndex] === 'auto' ? '自动' :
        themes[currentThemeIndex] === 'light' ? '明亮' : '深色'
    );
}

function handleThemeBtnClick() {
    currentThemeIndex = (currentThemeIndex + 1) % themes.length;
    setTheme(themes[currentThemeIndex]);
    updateThemeBtnIcon();
}

// 页面加载时应用本地存储主题，并根据时区自动切换
const savedTheme = localStorage.getItem('theme');
if (savedTheme && savedTheme !== 'auto') {
    currentThemeIndex = themes.indexOf(savedTheme);
    if (currentThemeIndex === -1) currentThemeIndex = 0;
    setTheme(themes[currentThemeIndex]);
} else {
    // 默认 auto 主题，currentThemeIndex = 0
    currentThemeIndex = 0;
    // auto 主题时根据本地时间切换明暗色
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 18) {
        document.documentElement.removeAttribute('data-theme'); // 明亮
    } else {
        document.documentElement.setAttribute('data-theme', 'dark'); // 深色
    }
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
    const socialLinks = document.querySelector('.social-links');
    
    // 清空现有链接
    navLinks.innerHTML = '';
    socialLinks.innerHTML = '';
    
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
    
    // 添加社交媒体链接
    Object.values(config.social).forEach(link => {
        const a = document.createElement('a');
        a.href = link.url;
        a.title = link.title;
        if (link.icon === 'cv-svg-icon') {
            a.innerHTML = '<img src="images/CV.svg" alt="CV" style="width: 60%; height: 60%; display: block; margin: 0 auto; filter: grayscale(1) brightness(0.2);" />';
        } else {
            a.innerHTML = `<i class="${link.icon}"></i>`;
        }
        socialLinks.appendChild(a);
    });

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

document.addEventListener('DOMContentLoaded', async () => {
    await initializeNavigation();
    await initializeContent();
    await loadAndRenderGitHubRepos();
    // 绑定主题按钮事件
    const themeBtn = document.querySelector('.theme-btn');
    if (themeBtn) {
        themeBtn.addEventListener('click', handleThemeBtnClick);
        updateThemeBtnIcon();
    }
    // 设置footer更新时间
    var d = new Date();
    var y = d.getFullYear();
    var m = (d.getMonth()+1).toString().padStart(2,'0');
    var day = d.getDate().toString().padStart(2,'0');
    var footerDate = document.getElementById('footer-update-date');
    if(footerDate) footerDate.textContent = `${y}-${m}-${day}`;
});