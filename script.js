// 全局变量
let data = {};
let currentSection = 'articles';
let isAuthenticated = false;
let authExpiryTime = 0;
let currentEditItem = null;
let currentEditType = null;

// 导入Firebase函数
import { collection, getDocs, setDoc, doc, deleteDoc, orderBy, query } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

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

// 初始化
async function init() {
    await loadData();
    setupEventListeners();
    renderContent();
    setupTheme();
}

// 加载数据
async function loadData() {
    try {
        // 从Firestore加载数据
        data = {
            articles: [],
            ideas: [],
            works: [],
            life: [],
            health: []
        };
        
        // 加载文章
        const articlesQuery = query(collection(window.db, 'articles'), orderBy('date', 'desc'), orderBy('time', 'desc'));
        const articlesSnapshot = await getDocs(articlesQuery);
        articlesSnapshot.forEach(doc => {
            data.articles.push({ id: doc.id, ...doc.data() });
        });
        
        // 加载灵感
        const ideasQuery = query(collection(window.db, 'ideas'), orderBy('date', 'desc'), orderBy('time', 'desc'));
        const ideasSnapshot = await getDocs(ideasQuery);
        ideasSnapshot.forEach(doc => {
            data.ideas.push({ id: doc.id, ...doc.data() });
        });
        
        // 加载作品
        const worksQuery = query(collection(window.db, 'works'), orderBy('date', 'desc'), orderBy('time', 'desc'));
        const worksSnapshot = await getDocs(worksQuery);
        worksSnapshot.forEach(doc => {
            data.works.push({ id: doc.id, ...doc.data() });
        });
        
        // 加载生活
        const lifeQuery = query(collection(window.db, 'life'), orderBy('date', 'desc'), orderBy('time', 'desc'));
        const lifeSnapshot = await getDocs(lifeQuery);
        lifeSnapshot.forEach(doc => {
            data.life.push({ id: doc.id, ...doc.data() });
        });
        
        // 加载健康
        const healthQuery = query(collection(window.db, 'health'), orderBy('date', 'desc'), orderBy('time', 'desc'));
        const healthSnapshot = await getDocs(healthQuery);
        healthSnapshot.forEach(doc => {
            data.health.push({ id: doc.id, ...doc.data() });
        });
        
        console.log('数据加载成功:', data);
    } catch (error) {
        console.error('加载数据失败:', error);
        // 使用默认数据
        data = {
            articles: [],
            ideas: [],
            works: [],
            life: [],
            health: []
        };
    }
}

// 保存数据到Firestore
async function saveData() {
    try {
        // 保存文章
        for (const article of data.articles) {
            await setDoc(doc(window.db, 'articles', article.id), article);
        }
        
        // 保存灵感
        for (const idea of data.ideas) {
            await setDoc(doc(window.db, 'ideas', idea.id), idea);
        }
        
        // 保存作品
        for (const work of data.works) {
            await setDoc(doc(window.db, 'works', work.id), work);
        }
        
        // 保存生活
        for (const item of data.life) {
            await setDoc(doc(window.db, 'life', item.id), item);
        }
        
        // 保存健康
        for (const item of data.health) {
            await setDoc(doc(window.db, 'health', item.id), item);
        }
        
        console.log('数据保存成功');
    } catch (error) {
        console.error('保存数据失败:', error);
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
    switch (currentSection) {
        case 'articles':
            renderArticles();
            break;
        case 'ideas':
            renderIdeas();
            break;
        case 'works':
            renderWorks();
            break;
        case 'life':
            renderLife();
            break;
        case 'health':
            renderHealth();
            break;
    }
}

// 渲染文章
function renderArticles() {
    // 按日期和时间倒序排序，确保最新的在最上面
    const articles = (data.articles || []).sort((a, b) => {
        // 创建包含时间的完整日期对象
        const dateA = new Date(`${a.date} ${a.time || '00:00:00'}`);
        const dateB = new Date(`${b.date} ${b.time || '00:00:00'}`);
        // 倒序排列：返回 dateB - dateA
        return dateB - dateA;
    });
    elements.articlesList.innerHTML = articles.map(article => `
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

// 确认删除
async function confirmDelete(type, id) {
    // 如果未认证或认证已过期，先验证密码
    if (!checkAuth()) {
        openPasswordModal(() => confirmDelete(type, id));
        return;
    }

    if (confirm('确定要删除吗？')) {
        try {
            // 从Firestore中删除数据
            await deleteDoc(doc(window.db, type, id));
            // 从本地数据中删除
            data[type] = data[type].filter(item => item.id !== id);
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

// 将localStorage数据导入到Firebase
async function importFromLocalStorage() {
    try {
        const savedData = localStorage.getItem('portfolioData');
        if (savedData) {
            const localStorageData = JSON.parse(savedData);
            
            // 导入文章
            for (const article of localStorageData.articles || []) {
                await setDoc(doc(window.db, 'articles', article.id), article);
            }
            
            // 导入灵感
            for (const idea of localStorageData.ideas || []) {
                await setDoc(doc(window.db, 'ideas', idea.id), idea);
            }
            
            // 导入作品
            for (const work of localStorageData.works || []) {
                await setDoc(doc(window.db, 'works', work.id), work);
            }
            
            // 导入生活
            for (const item of localStorageData.life || []) {
                await setDoc(doc(window.db, 'life', item.id), item);
            }
            
            // 导入健康
            for (const item of localStorageData.health || []) {
                await setDoc(doc(window.db, 'health', item.id), item);
            }
            
            console.log('localStorage数据导入成功');
            alert('数据导入成功！');
            // 重新加载数据
            await loadData();
            renderContent();
        } else {
            alert('localStorage中没有数据');
        }
    } catch (error) {
        console.error('导入数据失败:', error);
        alert('导入数据失败，请重试');
    }
}

// 初始化应用
init();