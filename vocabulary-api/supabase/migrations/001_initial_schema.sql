-- 英语学习应用数据库初始架构
-- 创建时间: 2024-12-30

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. 用户表 (如果使用自定义用户系统)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100),
    password_hash VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 单词分类表
CREATE TABLE IF NOT EXISTS word_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 单词表
CREATE TABLE IF NOT EXISTS words (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    english VARCHAR(200) NOT NULL,
    chinese TEXT,
    pronunciation VARCHAR(500),
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
    category_id UUID REFERENCES word_categories(id),
    example_sentence TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 用户学习进度表
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- 可以是Supabase auth.users的ID或自定义用户ID
    word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
    correct_count INTEGER DEFAULT 0,
    incorrect_count INTEGER DEFAULT 0,
    mastery_level INTEGER DEFAULT 0 CHECK (mastery_level >= 0 AND mastery_level <= 5),
    last_studied TIMESTAMP WITH TIME ZONE,
    study_streak INTEGER DEFAULT 0,
    is_difficult BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, word_id)
);

-- 5. 学习会话表
CREATE TABLE IF NOT EXISTS learning_sessions (
    id VARCHAR(255) PRIMARY KEY, -- 格式: userId_timestamp
    user_id UUID NOT NULL,
    session_type VARCHAR(50) DEFAULT 'daily_study',
    words_studied INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    accuracy DECIMAL(5,4) DEFAULT 0,
    duration_minutes DECIMAL(8,2) DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引提高查询性能
CREATE INDEX IF NOT EXISTS idx_words_difficulty ON words(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_words_category ON words(category_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_word ON user_progress(word_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_mastery ON user_progress(mastery_level);
CREATE INDEX IF NOT EXISTS idx_user_progress_last_studied ON user_progress(last_studied);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_user ON learning_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_created ON learning_sessions(created_at);

-- 插入默认的单词分类
INSERT INTO word_categories (id, name, description) VALUES
    (uuid_generate_v4(), 'IELTS Core', '雅思核心词汇'),
    (uuid_generate_v4(), 'TOEFL Essential', '托福必备词汇'),
    (uuid_generate_v4(), 'Daily English', '日常英语词汇'),
    (uuid_generate_v4(), 'Business English', '商务英语词汇'),
    (uuid_generate_v4(), 'Academic Writing', '学术写作词汇')
ON CONFLICT DO NOTHING;

-- 设置RLS (Row Level Security) 策略
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的学习进度
CREATE POLICY "Users can only access their own progress" ON user_progress
    FOR ALL USING (auth.uid()::text = user_id::text);

-- 用户只能访问自己的学习会话
CREATE POLICY "Users can only access their own sessions" ON learning_sessions
    FOR ALL USING (auth.uid()::text = user_id::text);

-- 所有用户都可以读取单词和分类（公开数据）
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Words are readable by everyone" ON words
    FOR SELECT USING (true);

CREATE POLICY "Categories are readable by everyone" ON word_categories
    FOR SELECT USING (true);

-- 创建更新时间戳的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表添加更新时间戳触发器
CREATE TRIGGER update_words_updated_at 
    BEFORE UPDATE ON words 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at 
    BEFORE UPDATE ON user_progress 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 完成提示
SELECT 'Database schema created successfully!' as message; 