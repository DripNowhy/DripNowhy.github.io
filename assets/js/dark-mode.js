document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  const lightIcon = themeToggle.querySelector('.light-icon');
  const darkIcon = themeToggle.querySelector('.dark-icon');
  
  // 检查之前保存的主题
  const savedTheme = localStorage.getItem('theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  
  // 应用主题
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  // 根据当前主题显示对应图标
  if (savedTheme === 'dark') {
    lightIcon.style.opacity = '0';
    lightIcon.style.transform = 'scale(0)';
    darkIcon.style.opacity = '1';
    darkIcon.style.transform = 'scale(1)';
  }
  
  // 切换主题
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });
}); 