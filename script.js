// 全局变量
let data = {};
let currentSection = 'articles';
let isAuthenticated = false;
let authExpiryTime = 0;
let currentEditItem = null;
let currentEditType = null;
let db;

// 初始化数据
function initData() {
    data = {
        articles: [
            {
                id: '1',
                title: '示例文章',
                content: '这是一篇示例文章，用于测试数据加载功能。',
                date: '2026-03-14',
                time: '12:00:00'
            }
        ],
        ideas: [
            {
                id: '1',
                title: '示例灵感',
                content: '这是一个示例灵感，用于测试数据加载功能。',
                date: '2026-03-14',
                time: '12:00:00'
            }
        ],
        works: [
            {
                id: '1',
                title: '示例作品',
                description: '这是一个示例作品，用于测试数据加载功能。',
                category: 'website',
                image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=default%20work%20image&image_size=landscape_16_9',
                date: '2026-03-14',
                time: '12:00:00'
            }
        ],
        life: [],
        health: []
    };
}

// DOM 元素
const elements = {
    navItems: document.querySelectorAll('.nav-item'),
    sections: document.querySelectorAll('.section'),
    themeToggle: document.getElementById('theme-toggle'),
    searchInput: document.getElementById('search-input'),
    searchBtn: document.getElementById('search-btn'),
    addArticleBtn: document.getElementById('add-article'),
    addIdeaBtn: document.getElementById('add-idea'),
    addWorkBtn: document.getElementById('add-work'),
    passwordModal: document.getElementById('password-modal'),
    passwordInput: document.getElementById('password-input'),
    passwordConfirm: document.getElementById('password-confirm'),
    passwordCancel: document.getElementById('password-cancel'),
    editModal: document.getElementById('edit-modal'),
    editTitle: document.getElementById('edit-title'),
    editItemTitle: document.getElementById('edit-item-title'),
    editItemContent: document.getElementById('edit-item-content'),
    editItemImage: document.getElementById('edit-item-image'),
    editItemCategory: document.getElementById('edit-item-category'),
    workSpecific: document.getElementById('work-specific'),
    editConfirm: document.getElementById('edit-confirm'),
    editCancel: document.getElementById('edit-cancel'),
    categoryBtns: document.querySelectorAll('.category-btn'),
    articlesList: document.getElementById('articles-list'),
    ideasList: document.getElementById('ideas-list'),
    worksList: document.getElementById('works-list'),
    lifeList: document.getElementById('life-list'),
    healthList: document.getElementById('health-list')
};

// 从后端API加载数据
async function loadDataFromAPI() {
    try {
        console.log('开始从后端API加载数据...');
        const response = await fetch('http://localhost:3001/api/data');
        if (response.ok) {
            const apiData = await response.json();
            console.log('从API加载的数据:', apiData);
            data = apiData;
            console.log('从API加载数据完成');
            return true;
        } else {
            console.log('API加载失败，尝试从本地存储加载');
            return false;
        }
    } catch (error) {
        console.error('从API加载数据失败:', error);
        return false;
    }
}

// 从本地存储加载数据
function loadDataFromLocalStorage() {
    try {
        console.log('开始从本地存储加载数据...');
        const backupData = localStorage.getItem('backupData');
        if (backupData) {
            const parsedData = JSON.parse(backupData);
            console.log('从本地存储加载的数据:', parsedData);
            data = parsedData;
            console.log('从本地存储加载数据完成');
            return true;
        } else {
            console.log('本地存储中没有数据');
            return false;
        }
    } catch (error) {
        console.error('从本地存储加载数据失败:', error);
        return false;
    }
}

// 初始化
async function init() {
    try {
        console.log('开始初始化...');
        
        // 检查DOM元素是否存在
        console.log('检查DOM元素...');
        console.log('articlesList:', elements.articlesList);
        console.log('ideasList:', elements.ideasList);
        console.log('worksList:', elements.worksList);
        
        // 初始化默认数据
        initData();
        console.log('默认数据初始化完成:', data);
        
        // 尝试从API加载数据
        const apiSuccess = await loadDataFromAPI();
        
        // 如果API加载失败，尝试从本地存储加载
        if (!apiSuccess) {
            console.log('API加载失败，尝试从本地存储加载');
            loadDataFromLocalStorage();
        }
        
        console.log('数据加载完成:', data);
        console.log('数据中的文章数量:', data.articles.length);
        console.log('数据中的灵感数量:', data.ideas.length);
        console.log('数据中的作品数量:', data.works.length);
        
        setupEventListeners();
        console.log('事件监听器设置完成');
        
        renderContent();
        console.log('内容渲染完成');
        
        setupTheme();
        console.log('主题设置完成');
    } catch (error) {
        console.error('初始化失败:', error);
        
        // 即使初始化失败，也尝试创建示例数据并渲染
        try {
            console.log('尝试创建示例数据...');
            initData();
            console.log('示例数据创建成功:', data);
            
            // 尝试渲染内容
            console.log('尝试渲染内容...');
            renderContent();
            console.log('内容渲染完成');
            
            // 尝试设置主题
            console.log('尝试设置主题...');
            setupTheme();
            console.log('主题设置完成');
        } catch (e) {
            console.error('创建示例数据和渲染失败:', e);
        }
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 导航切换
    elements.navItems.forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            switchSection(section);
        });
    });

    // 主题切换
    elements.themeToggle.addEventListener('click', toggleTheme);

    // 搜索功能
    elements.searchBtn.addEventListener('click', performSearch);
    elements.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // 添加按钮
    elements.addArticleBtn.addEventListener('click', () => openEditModal('articles'));
    elements.addIdeaBtn.addEventListener('click', () => openEditModal('ideas'));
    elements.addWorkBtn.addEventListener('click', () => openEditModal('works'));

    // 密码模态框
    elements.passwordConfirm.addEventListener('click', verifyPassword);
    elements.passwordCancel.addEventListener('click', closePasswordModal);

    // 编辑模态框
    elements.editConfirm.addEventListener('click', saveEdit);
    elements.editCancel.addEventListener('click', closeEditModal);

    // 作品分类
    elements.categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderWorks();
        });
    });
}

// 切换 section
function switchSection(section) {
    currentSection = section;
    
    // 更新导航状态
    elements.navItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.section === section) {
            item.classList.add('active');
        }
    });

    // 更新内容区域
    elements.sections.forEach(s => {
        s.classList.remove('active');
        if (s.id === `${section}-section`) {
            s.classList.add('active');
        }
    });

    // 重新渲染内容
    renderContent();
}

// 渲染内容
function renderContent() {
    console.log('开始渲染内容...');
    console.log('当前section:', currentSection);
    console.log('数据:', data);
    
    switch (currentSection) {
        case 'articles':
            console.log('渲染文章...');
            renderArticles();
            console.log('文章渲染完成');
            break;
        case 'ideas':
            console.log('渲染灵感...');
            renderIdeas();
            console.log('灵感渲染完成');
            break;
        case 'works':
            console.log('渲染作品...');
            renderWorks();
            console.log('作品渲染完成');
            break;
        case 'life':
            console.log('渲染生活...');
            renderLife();
            console.log('生活渲染完成');
            break;
        case 'health':
            console.log('渲染健康...');
            renderHealth();
            console.log('健康渲染完成');
            break;
        default:
            console.log('未知section:', currentSection);
    }
    console.log('内容渲染完成');
}

// 渲染文章
function renderArticles() {
    console.log('开始渲染文章...');
    console.log('articlesList元素:', elements.articlesList);
    
    // 按日期和时间倒序排序，确保最新的在最上面
    const articles = (data.articles || []).sort((a, b) => {
        // 创建包含时间的完整日期对象
        const dateA = new Date(`${a.date} ${a.time || '00:00:00'}`);
        const dateB = new Date(`${b.date} ${b.time || '00:00:00'}`);
        // 倒序排列：返回 dateB - dateA
        return dateB - dateA;
    });
    
    console.log('文章数据:', articles);
    
    const articlesHTML = articles.map(article => `
        <div class="content-item">
            <div class="title-container">
                <h3>${article.title}</h3>
                <span class="title-time">${article.date} ${article.time || ''}</span>
            </div>
            <p>${article.content}</p>
            <div class="actions">
                <button class="action-btn edit-btn" onclick="openEditModal('articles', '${article.id}')">编辑</button>
                <button class="action-btn delete-btn" onclick="confirmDelete('articles', '${article.id}')">删除</button>
            </div>
        </div>
    `).join('');
    
    console.log('文章HTML:', articlesHTML);
    
    if (elements.articlesList) {
        elements.articlesList.innerHTML = articlesHTML;
        console.log('文章HTML已设置到articlesList');
    } else {
        console.error('articlesList元素不存在');
    }
    
    console.log('文章渲染完成');
}

// 渲染灵感
function renderIdeas() {
    // 按日期和时间倒序排序，确保最新的在最上面
    const ideas = (data.ideas || []).sort((a, b) => {
        // 创建包含时间的完整日期对象
        const dateA = new Date(`${a.date} ${a.time || '00:00:00'}`);
        const dateB = new Date(`${b.date} ${b.time || '00:00:00'}`);
        // 倒序排列：返回 dateB - dateA
        return dateB - dateA;
    });
    elements.ideasList.innerHTML = ideas.map(idea => `
        <div class="content-item">
            <div class="title-container">
                <h3>${idea.title}</h3>
                <span class="title-time">${idea.date} ${idea.time || ''}</span>
            </div>
            <p>${idea.content}</p>
            <div class="actions">
                <button class="action-btn edit-btn" onclick="openEditModal('ideas', '${idea.id}')">编辑</button>
                <button class="action-btn delete-btn" onclick="confirmDelete('ideas', '${idea.id}')">删除</button>
            </div>
        </div>
    `).join('');
}

// 渲染作品
function renderWorks() {
    const works = (data.works || []).sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time || '00:00:00'}`);
        const dateB = new Date(`${b.date} ${b.time || '00:00:00'}`);
        return dateB - dateA;
    });
    const activeCategory = document.querySelector('.category-btn.active').dataset.category;
    
    const filteredWorks = activeCategory === 'all' 
        ? works 
        : works.filter(work => work.category === activeCategory);
    
    elements.worksList.innerHTML = filteredWorks.map(work => `
        <div class="work-item">
            <img src="${work.image}" alt="${work.title}" class="work-image">
            <div class="work-category">${getCategoryName(work.category)}</div>
            <h3>${work.title}</h3>
            <p>${work.description}</p>
            <div class="meta">
                <span>${work.date}</span>
            </div>
            <div class="actions">
                <button class="action-btn edit-btn" onclick="openEditModal('works', '${work.id}')">编辑</button>
                <button class="action-btn delete-btn" onclick="confirmDelete('works', '${work.id}')">删除</button>
            </div>
        </div>
    `).join('');
}

// 渲染生活
function renderLife() {
    const life = (data.life || []).sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time || '00:00:00'}`);
        const dateB = new Date(`${b.date} ${b.time || '00:00:00'}`);
        return dateB - dateA;
    });
    elements.lifeList.innerHTML = life.map(item => `
        <div class="content-item">
            <div class="title-container">
                <h3>${item.title}</h3>
                <span class="title-time">${item.date}</span>
            </div>
            <p>${item.content}</p>
        </div>
    `).join('');
}

// 渲染健康
function renderHealth() {
    const health = (data.health || []).sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time || '00:00:00'}`);
        const dateB = new Date(`${b.date} ${b.time || '00:00:00'}`);
        return dateB - dateA;
    });
    elements.healthList.innerHTML = health.map(item => `
        <div class="content-item">
            <div class="title-container">
                <h3>${item.title}</h3>
                <span class="title-time">${item.date}</span>
            </div>
            <p>${item.content}</p>
        </div>
    `).join('');
}

// 获取分类名称
function getCategoryName(category) {
    const categoryMap = {
        'website': '网站',
        'app': 'App',
        'mini-program': '小程序'
    };
    return categoryMap[category] || category;
}

// 打开密码模态框
function openPasswordModal(callback) {
    elements.passwordModal.classList.add('show');
    elements.passwordInput.value = '';
    window.passwordCallback = callback;
}

// 关闭密码模态框
function closePasswordModal() {
    elements.passwordModal.classList.remove('show');
    window.passwordCallback = null;
}

// 验证密码
function verifyPassword() {
    const password = elements.passwordInput.value;
    if (password === '111000') {
        isAuthenticated = true;
        // 设置30分钟有效期
        authExpiryTime = Date.now() + 30 * 60 * 1000;
        closePasswordModal();
        if (window.passwordCallback) {
            window.passwordCallback();
        }
    } else {
        alert('密码错误，请重新输入');
    }
}

// 检查认证是否有效
function checkAuth() {
    if (isAuthenticated && Date.now() > authExpiryTime) {
        isAuthenticated = false;
        alert('登录已过期，请重新输入密码');
    }
    return isAuthenticated;
}

// 打开编辑模态框
function openEditModal(type, id = null) {
    // 如果未认证或认证已过期，先验证密码
    if (!checkAuth()) {
        openPasswordModal(() => openEditModal(type, id));
        return;
    }

    currentEditType = type;
    currentEditItem = id ? data[type].find(item => item.id === id) : null;

    // 设置模态框标题
    elements.editTitle.textContent = id ? '编辑内容' : '添加内容';

    // 重置表单
    elements.editItemTitle.value = '';
    elements.editItemContent.value = '';
    elements.editItemImage.value = '';

    // 显示/隐藏作品特定字段
    if (type === 'works') {
        elements.workSpecific.style.display = 'block';
    } else {
        elements.workSpecific.style.display = 'none';
    }

    // 填充现有数据
    if (currentEditItem) {
        elements.editItemTitle.value = currentEditItem.title;
        elements.editItemContent.value = type === 'works' ? currentEditItem.description : currentEditItem.content;
        if (type === 'works') {
            elements.editItemCategory.value = currentEditItem.category;
        }
    }

    // 显示模态框
    elements.editModal.classList.add('show');
}

// 关闭编辑模态框
function closeEditModal() {
    elements.editModal.classList.remove('show');
    currentEditItem = null;
    currentEditType = null;
}

// 保存编辑
async function saveEdit() {
    const title = elements.editItemTitle.value.trim();
    const content = elements.editItemContent.value.trim();

    if (!title || !content) {
        alert('请填写标题和内容');
        return;
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0];

    // 处理图片上传
    let imageUrl = currentEditItem?.image;
    if (currentEditType === 'works' && elements.editItemImage.files.length > 0) {
        // 使用FileReader读取上传的图片
        const reader = new FileReader();
        reader.onload = async function(e) {
            imageUrl = e.target.result;
            await saveItemWithImage(imageUrl);
        };
        reader.readAsDataURL(elements.editItemImage.files[0]);
        return;
    }
    
    await saveItemWithImage(imageUrl);
    
    async function saveItemWithImage(imageUrl) {
        if (currentEditItem) {
            // 编辑现有项目
            const index = data[currentEditType].findIndex(item => item.id === currentEditItem.id);
            if (index !== -1) {
                if (currentEditType === 'works') {
                    data[currentEditType][index] = {
                        ...data[currentEditType][index],
                        title,
                        description: content,
                        category: elements.editItemCategory.value,
                        image: imageUrl || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=default%20work%20image&image_size=landscape_16_9'
                    };
                } else {
                    data[currentEditType][index] = {
                        ...data[currentEditType][index],
                        title,
                        content
                    };
                }
            }
        } else {
            // 添加新项目
            const newItem = {
                id: Date.now().toString(),
                title,
                date: today,
                time: time
            };

            if (currentEditType === 'works') {
                newItem.description = content;
                newItem.category = elements.editItemCategory.value;
                newItem.image = imageUrl || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=default%20work%20image&image_size=landscape_16_9';
            } else {
                newItem.content = content;
            }

            data[currentEditType].push(newItem);
        }

        // 保存数据并重新渲染
        await saveData();
        renderContent();
        closeEditModal();
    }
}

// 保存数据
async function saveData() {
    try {
        // 保存到本地存储
        localStorage.setItem('backupData', JSON.stringify(data));
        console.log('数据已保存到本地存储:', data);
        
        // 尝试保存到后端API
        try {
            const response = await fetch('http://localhost:3001/api/data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (response.ok) {
                console.log('数据已保存到TDSQL-C数据库');
            } else {
                console.log('TDSQL-C保存失败，但数据已保存到本地存储');
            }
        } catch (apiError) {
            console.error('API调用失败:', apiError);
            console.log('API调用失败，但数据已保存到本地存储');
        }
    } catch (error) {
        console.error('保存数据失败:', error);
    }
}

// 确认删除
async function confirmDelete(type, id) {
    // 如果未认证或认证已过期，先验证密码
    if (!checkAuth()) {
        openPasswordModal(() => confirmDelete(type, id));
        return;
    }

    if (confirm('确定要删除吗？')) {
        try {
            // 从本地数据中删除
            data[type] = data[type].filter(item => item.id !== id);
            // 保存到本地存储
            await saveData();
            // 重新渲染内容
            renderContent();
            console.log('删除成功');
        } catch (error) {
            console.error('删除失败:', error);
            alert('删除失败，请重试');
        }
    }
}

// 执行搜索
function performSearch() {
    const searchTerm = elements.searchInput.value.toLowerCase().trim();
    if (!searchTerm) {
        renderContent();
        return;
    }

    // 搜索逻辑
    switch (currentSection) {
        case 'articles':
            const filteredArticles = data.articles.filter(article => 
                article.title.toLowerCase().includes(searchTerm) || 
                article.content.toLowerCase().includes(searchTerm)
            ).sort((a, b) => {
                const dateA = new Date(`${a.date} ${a.time || '00:00:00'}`);
                const dateB = new Date(`${b.date} ${b.time || '00:00:00'}`);
                return dateB - dateA;
            });
            elements.articlesList.innerHTML = filteredArticles.map(article => `
                <div class="content-item">
                    <div class="title-container">
                        <h3>${article.title}</h3>
                        <span class="title-time">${article.date} ${article.time || ''}</span>
                    </div>
                    <p>${article.content}</p>
                    <div class="actions">
                        <button class="action-btn edit-btn" onclick="openEditModal('articles', '${article.id}')">编辑</button>
                        <button class="action-btn delete-btn" onclick="confirmDelete('articles', '${article.id}')">删除</button>
                    </div>
                </div>
            `).join('');
            break;
        case 'ideas':
            const filteredIdeas = data.ideas.filter(idea => 
                idea.title.toLowerCase().includes(searchTerm) || 
                idea.content.toLowerCase().includes(searchTerm)
            ).sort((a, b) => {
                const dateA = new Date(`${a.date} ${a.time || '00:00:00'}`);
                const dateB = new Date(`${b.date} ${b.time || '00:00:00'}`);
                return dateB - dateA;
            });
            elements.ideasList.innerHTML = filteredIdeas.map(idea => `
                <div class="content-item">
                    <div class="title-container">
                        <h3>${idea.title}</h3>
                        <span class="title-time">${idea.date} ${idea.time || ''}</span>
                    </div>
                    <p>${idea.content}</p>
                    <div class="actions">
                        <button class="action-btn edit-btn" onclick="openEditModal('ideas', '${idea.id}')">编辑</button>
                        <button class="action-btn delete-btn" onclick="confirmDelete('ideas', '${idea.id}')">删除</button>
                    </div>
                </div>
            `).join('');
            break;
        case 'works':
            const filteredWorks = data.works.filter(work => 
                work.title.toLowerCase().includes(searchTerm) || 
                work.description.toLowerCase().includes(searchTerm)
            ).sort((a, b) => {
                const dateA = new Date(`${a.date} ${a.time || '00:00:00'}`);
                const dateB = new Date(`${b.date} ${b.time || '00:00:00'}`);
                return dateB - dateA;
            });
            elements.worksList.innerHTML = filteredWorks.map(work => `
                <div class="work-item">
                    <img src="${work.image}" alt="${work.title}" class="work-image">
                    <div class="work-category">${getCategoryName(work.category)}</div>
                    <h3>${work.title}</h3>
                    <p>${work.description}</p>
                    <div class="meta">
                        <span>${work.date}</span>
                    </div>
                    <div class="actions">
                        <button class="action-btn edit-btn" onclick="openEditModal('works', '${work.id}')">编辑</button>
                        <button class="action-btn delete-btn" onclick="confirmDelete('works', '${work.id}')">删除</button>
                    </div>
                </div>
            `).join('');
            break;
    }
}

// 设置主题
function setupTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.className = `${savedTheme}-mode`;
    updateThemeIcon(savedTheme);
}

// 更新主题图标
function updateThemeIcon(theme) {
    elements.themeToggle.textContent = theme === 'dark' ? '🌙' : '☀️';
}

// 切换主题
function toggleTheme() {
    const currentTheme = document.body.className.includes('dark') ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.className = `${newTheme}-mode`;
    updateThemeIcon(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // 添加动画效果
    elements.themeToggle.style.animation = 'pulse 0.5s ease-in-out';
    setTimeout(() => {
        elements.themeToggle.style.animation = '';
    }, 500);
}

// 初始化应用将在Firebase SDK加载后手动调用