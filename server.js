// Node.js后端服务，连接TDSQL-C数据库
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

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
    
    // 创建文章表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS articles (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        date DATE NOT NULL,
        time VARCHAR(8) NOT NULL
      )
    `);
    
    // 创建灵感表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS ideas (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        date DATE NOT NULL,
        time VARCHAR(8) NOT NULL
      )
    `);
    
    // 创建作品表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS works (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        image VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        time VARCHAR(8) NOT NULL
      )
    `);
    
    // 创建生活表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS life (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        date DATE NOT NULL,
        time VARCHAR(8) NOT NULL
      )
    `);
    
    // 创建健康表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS health (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        date DATE NOT NULL,
        time VARCHAR(8) NOT NULL
      )
    `);
    
    console.log('表结构创建成功');
    connection.release();
  } catch (error) {
    console.error('创建表结构失败:', error);
  }
}

// API接口：获取所有数据
app.get('/api/data', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // 获取文章
    const [articles] = await connection.execute('SELECT * FROM articles ORDER BY date DESC, time DESC');
    
    // 获取灵感
    const [ideas] = await connection.execute('SELECT * FROM ideas ORDER BY date DESC, time DESC');
    
    // 获取作品
    const [works] = await connection.execute('SELECT * FROM works ORDER BY date DESC, time DESC');
    
    // 获取生活
    const [life] = await connection.execute('SELECT * FROM life ORDER BY date DESC, time DESC');
    
    // 获取健康
    const [health] = await connection.execute('SELECT * FROM health ORDER BY date DESC, time DESC');
    
    connection.release();
    
    res.json({
      articles,
      ideas,
      works,
      life,
      health
    });
  } catch (error) {
    console.error('获取数据失败:', error);
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
          'INSERT INTO articles (id, title, content, date, time) VALUES (?, ?, ?, ?, ?)',
          [article.id, article.title, article.content, formatDate(article.date), article.time]
        );
      }
      
      // 插入灵感
      for (const idea of ideas) {
        await connection.execute(
          'INSERT INTO ideas (id, title, content, date, time) VALUES (?, ?, ?, ?, ?)',
          [idea.id, idea.title, idea.content, formatDate(idea.date), idea.time]
        );
      }
      
      // 插入作品
      for (const work of works) {
        await connection.execute(
          'INSERT INTO works (id, title, description, category, image, date, time) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [work.id, work.title, work.description, work.category, work.image, formatDate(work.date), work.time]
        );
      }
      
      // 插入生活
      for (const lifeItem of life) {
        await connection.execute(
          'INSERT INTO life (id, title, content, date, time) VALUES (?, ?, ?, ?, ?)',
          [lifeItem.id, lifeItem.title, lifeItem.content, formatDate(lifeItem.date), lifeItem.time]
        );
      }
      
      // 插入健康
      for (const healthItem of health) {
        await connection.execute(
          'INSERT INTO health (id, title, content, date, time) VALUES (?, ?, ?, ?, ?)',
          [healthItem.id, healthItem.title, healthItem.content, formatDate(healthItem.date), healthItem.time]
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
