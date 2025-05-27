-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建单词分类表
CREATE TABLE IF NOT EXISTS word_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7), -- 十六进制颜色代码
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建单词表
CREATE TABLE IF NOT EXISTS words (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    english VARCHAR(255) NOT NULL,
    chinese VARCHAR(255) NOT NULL,
    pronunciation VARCHAR(255),
    difficulty_level INTEGER NOT NULL CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
    category_id UUID REFERENCES word_categories(id) ON DELETE SET NULL,
    audio_url TEXT,
    example_sentence TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建用户学习进度表
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
    mastery_level INTEGER NOT NULL DEFAULT 0 CHECK (mastery_level >= 0 AND mastery_level <= 100),
    last_reviewed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    review_count INTEGER NOT NULL DEFAULT 0,
    correct_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, word_id)
);

-- 创建学习会话表
CREATE TABLE IF NOT EXISTS learning_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_type VARCHAR(20) NOT NULL CHECK (session_type IN ('reading', 'listening', 'writing', 'speaking')),
    words_studied UUID[] NOT NULL,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 0,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_words_difficulty ON words(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_words_category ON words(category_id);
CREATE INDEX IF NOT EXISTS idx_words_english ON words(english);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_word_id ON user_progress(word_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_mastery ON user_progress(mastery_level);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_user_id ON learning_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_type ON learning_sessions(session_type);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_completed ON learning_sessions(completed_at);

-- 创建更新时间戳的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表添加更新时间戳触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_words_updated_at BEFORE UPDATE ON words
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入默认的单词分类
INSERT INTO word_categories (name, description, color) VALUES
    ('基础词汇', '日常生活中最常用的基础单词', '#3B82F6'),
    ('商务英语', '商务和职场环境中使用的词汇', '#10B981'),
    ('学术词汇', '学术写作和研究中常见的词汇', '#8B5CF6'),
    ('旅游英语', '旅行和观光相关的词汇', '#F59E0B'),
    ('科技词汇', '科技和互联网相关的现代词汇', '#EF4444')
ON CONFLICT (name) DO NOTHING;

-- 设置行级安全策略 (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的数据
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own progress" ON user_progress
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sessions" ON learning_sessions
    FOR ALL USING (auth.uid() = user_id);

-- 单词和分类表对所有认证用户可读
CREATE POLICY "Authenticated users can view words" ON words
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view categories" ON word_categories
    FOR SELECT USING (auth.role() = 'authenticated');

-- 创建用户注册时自动创建用户记录的函数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器，在用户注册时自动创建用户记录
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 