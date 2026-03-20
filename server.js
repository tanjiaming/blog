// Node.js后端服务，连接TDSQL-C数据库
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const fileUpload = require('express-fileupload');

const app = express();
const PORT = process.env.PORT || 3001;

// 使用文件上传中间件
app.use(fileUpload());

// 中间件
app.use(cors({
  origin: '*', // 允许所有来源
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' })); // 增加请求体大小限制
app.use(express.urlencoded({ limit: '10mb', extended: true })); // 增加URL编码请求体大小限制

// 静态文件服务
app.use(express.static('.'));
app.use('/images', express.static('images'));

// 处理根路径请求，返回index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// TDSQL-C数据库连接配置
const dbConfig = {
  host: 'sh-cynosdbmysql-grp-ehho0drs.sql.tencentcdb.com', // 腾讯云TDSQL-C的主机地址
  user: 'root', // 数据库用户名
  password: '0822tjmok!', // 数据库密码
  database: 'blog_db', // 数据库名称
  port: 24320, // 腾讯云TDSQL-C的端口
  ssl: false // 禁用SSL连接
};

// 数据库连接池
let pool;

// 初始化数据库连接
async function initDatabase() {
  try {
    console.log('正在连接数据库...');
    console.log('数据库配置:', {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database
    });
    
    pool = mysql.createPool({
      ...dbConfig,
      connectTimeout: 10000, // 增加连接超时时间
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    console.log('数据库连接池创建成功');
    
    // 测试连接
    console.log('正在测试数据库连接...');
    const connection = await pool.getConnection();
    console.log('数据库连接成功');
    connection.release();
    
    // 创建表结构
    await createTables();
  } catch (error) {
    console.error('数据库连接失败:', error);
    console.error('错误类型:', error.code);
    console.error('错误信息:', error.message);
    
    // 提供连接失败的可能原因
    console.log('\n连接失败可能的原因:');
    console.log('1. 网络连接问题');
    console.log('2. 数据库公网访问未开启');
    console.log('3. 防火墙规则限制');
    console.log('4. 数据库地址或端口不正确');
    console.log('5. 数据库用户名或密码错误');
  }
}

// 创建表结构
async function createTables() {
  try {
    const connection = await pool.getConnection();
    
    // 不再删除旧表，确保历史数据不会丢失
    console.log('保留现有表结构，确保历史数据不丢失');
    
    // 创建文章表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS articles (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        date DATE NOT NULL,
        time VARCHAR(8) NOT NULL,
        isDelete INT DEFAULT 1
      )
    `);
    
    // 尝试为现有表添加isDelete字段
    try {
      await connection.execute(`ALTER TABLE articles ADD COLUMN isDelete INT DEFAULT 1`);
    } catch (error) {
      // 如果字段已存在，忽略错误
      console.log('articles表isDelete字段可能已存在:', error.message);
    }
    
    // 创建灵感表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS ideas (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        date DATE NOT NULL,
        time VARCHAR(8) NOT NULL,
        isDelete INT DEFAULT 1
      )
    `);
    
    // 尝试为现有表添加isDelete字段
    try {
      await connection.execute(`ALTER TABLE ideas ADD COLUMN isDelete INT DEFAULT 1`);
    } catch (error) {
      // 如果字段已存在，忽略错误
      console.log('ideas表isDelete字段可能已存在:', error.message);
    }
    
    // 创建作品表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS works (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        image VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        time VARCHAR(8) NOT NULL,
        isDelete INT DEFAULT 1
      )
    `);
    
    // 尝试为现有表添加isDelete字段
    try {
      await connection.execute(`ALTER TABLE works ADD COLUMN isDelete INT DEFAULT 1`);
    } catch (error) {
      // 如果字段已存在，忽略错误
      console.log('works表isDelete字段可能已存在:', error.message);
    }
    
    // 创建生活表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS life (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        date DATE NOT NULL,
        time VARCHAR(8) NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        emoji VARCHAR(10) DEFAULT '📝',
        isDelete INT DEFAULT 1
      )
    `);
    
    // 尝试为现有表添加isDelete字段
    try {
      await connection.execute(`ALTER TABLE life ADD COLUMN isDelete INT DEFAULT 1`);
    } catch (error) {
      // 如果字段已存在，忽略错误
      console.log('life表isDelete字段可能已存在:', error.message);
    }
    
    // 创建健康表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS health (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        date DATE NOT NULL,
        time VARCHAR(8) NOT NULL,
        isDelete INT DEFAULT 1
      )
    `);
    
    // 尝试为现有表添加isDelete字段
    try {
      await connection.execute(`ALTER TABLE health ADD COLUMN isDelete INT DEFAULT 1`);
    } catch (error) {
      // 如果字段已存在，忽略错误
      console.log('health表isDelete字段可能已存在:', error.message);
    }
    
    console.log('表结构创建成功');
    connection.release();
  } catch (error) {
    console.error('创建表结构失败:', error);
  }
}

// 图片上传API
const fs = require('fs');
const path = require('path');

app.post('/api/upload', (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: '没有上传图片' });
    }

    const image = req.files.image;
    const fileName = `${Date.now()}-${image.name}`;
    const filePath = path.join(__dirname, 'images', fileName);

    // 保存图片
    image.mv(filePath, (err) => {
      if (err) {
        console.error('保存图片失败:', err);
        return res.status(500).json({ error: '保存图片失败' });
      }

      // 返回图片URL
      const imageUrl = `/images/${fileName}`;
      res.json({ success: true, imageUrl });
    });
  } catch (error) {
    console.error('上传图片失败:', error);
    res.status(500).json({ error: '上传图片失败' });
  }
});

// API接口：获取所有数据
app.get('/api/data', async (req, res) => {
  console.log('收到API数据请求');
  try {
    console.log('开始处理API数据请求');
    const connection = await pool.getConnection();
    console.log('数据库连接成功');
    
    // 辅助函数：格式化日期
    function formatDate(date) {
      if (!date) return null;
      // 如果是Date对象，转换为YYYY-MM-DD格式
      if (date instanceof Date) {
        return date.toISOString().split('T')[0];
      }
      // 如果是字符串，确保是YYYY-MM-DD格式
      if (typeof date === 'string') {
        if (date.includes('T')) {
          return date.split('T')[0];
        }
        return date;
      }
      return date;
    }
    
    // 获取文章
    console.log('开始获取文章数据');
    const [articles] = await connection.execute('SELECT * FROM articles WHERE isDelete = 1 ORDER BY date DESC, time DESC');
    console.log('获取到文章数据:', articles.length, '条');
    const formattedArticles = articles.map(article => ({
      ...article,
      date: formatDate(article.date)
    }));
    
    // 获取灵感
    console.log('开始获取灵感数据');
    const [ideas] = await connection.execute('SELECT * FROM ideas WHERE isDelete = 1 ORDER BY date DESC, time DESC');
    console.log('获取到灵感数据:', ideas.length, '条');
    const formattedIdeas = ideas.map(idea => ({
      ...idea,
      date: formatDate(idea.date)
    }));
    
    // 获取作品
    console.log('开始获取作品数据');
    const [works] = await connection.execute('SELECT * FROM works WHERE isDelete = 1 ORDER BY date DESC, time DESC');
    console.log('获取到作品数据:', works.length, '条');
    const formattedWorks = works.map(work => ({
      ...work,
      date: formatDate(work.date)
    }));
    
    // 获取生活
    console.log('开始获取生活数据');
    const [life] = await connection.execute('SELECT * FROM life WHERE isDelete = 1 ORDER BY date DESC, time DESC');
    console.log('获取到生活数据:', life.length, '条');
    const formattedLife = life.map(lifeItem => ({
      ...lifeItem,
      date: formatDate(lifeItem.date)
    }));
    
    // 获取健康
    console.log('开始获取健康数据');
    const [health] = await connection.execute('SELECT * FROM health WHERE isDelete = 1 ORDER BY date DESC, time DESC');
    console.log('获取到健康数据:', health.length, '条');
    const formattedHealth = health.map(healthItem => ({
      ...healthItem,
      date: formatDate(healthItem.date)
    }));
    
    connection.release();
    console.log('数据库连接已释放');
    
    const responseData = {
      articles: formattedArticles,
      ideas: formattedIdeas,
      works: formattedWorks,
      life: formattedLife,
      health: formattedHealth
    };
    
    console.log('准备返回数据:', JSON.stringify(responseData, null, 2));
    res.json(responseData);
    console.log('数据已返回');
  } catch (error) {
    console.error('获取数据失败:', error);
    console.error('错误类型:', error.name);
    console.error('错误消息:', error.message);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({ error: '获取数据失败' });
  }
});

// API接口：保存数据
app.post('/api/data', async (req, res) => {
  try {
    const { articles, ideas, works, life, health } = req.body;
    const connection = await pool.getConnection();
    
    // 开始事务
    await connection.beginTransaction();
    
    try {
      // 清空所有表
      await connection.execute('DELETE FROM articles');
      await connection.execute('DELETE FROM ideas');
      await connection.execute('DELETE FROM works');
      await connection.execute('DELETE FROM life');
      await connection.execute('DELETE FROM health');
      
      // 辅助函数：将日期转换为YYYY-MM-DD格式
      function formatDate(date) {
        if (!date) return null;
        // 如果是ISO格式的字符串，提取日期部分
        if (typeof date === 'string' && date.includes('T')) {
          return date.split('T')[0];
        }
        return date;
      }
      
      // 插入文章
      for (const article of articles) {
        await connection.execute(
          'INSERT INTO articles (id, title, content, date, time, isDelete) VALUES (?, ?, ?, ?, ?, ?)',
          [article.id, article.title, article.content, formatDate(article.date), article.time, article.isDelete !== undefined ? article.isDelete : 1]
        );
      }
      
      // 插入灵感
      for (const idea of ideas) {
        await connection.execute(
          'INSERT INTO ideas (id, title, content, date, time, isDelete) VALUES (?, ?, ?, ?, ?, ?)',
          [idea.id, idea.title, idea.content, formatDate(idea.date), idea.time, idea.isDelete !== undefined ? idea.isDelete : 1]
        );
      }
      
      // 插入作品
      for (const work of works) {
        await connection.execute(
          'INSERT INTO works (id, title, description, category, image, date, time, isDelete) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [work.id, work.title, work.description, work.category, work.image, formatDate(work.date), work.time, work.isDelete !== undefined ? work.isDelete : 1]
        );
      }
      
      // 插入生活
      for (const lifeItem of life) {
        await connection.execute(
          'INSERT INTO life (id, title, content, date, time, completed, emoji, isDelete) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [lifeItem.id, lifeItem.title, lifeItem.content, formatDate(lifeItem.date), lifeItem.time, lifeItem.completed || false, lifeItem.emoji || '📝', lifeItem.isDelete !== undefined ? lifeItem.isDelete : 1]
        );
      }
      
      // 插入健康
      for (const healthItem of health) {
        await connection.execute(
          'INSERT INTO health (id, title, content, date, time, isDelete) VALUES (?, ?, ?, ?, ?, ?)',
          [healthItem.id, healthItem.title, healthItem.content, formatDate(healthItem.date), healthItem.time, healthItem.isDelete !== undefined ? healthItem.isDelete : 1]
        );
      }
      
      // 提交事务
      await connection.commit();
      console.log('数据保存成功');
      res.json({ success: true, message: '数据保存成功' });
    } catch (error) {
      // 回滚事务
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('保存数据失败:', error);
    res.status(500).json({ error: '保存数据失败' });
  }
});

// 启动服务器
app.listen(PORT, async () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  // 初始化数据库连接
  await initDatabase();
});
