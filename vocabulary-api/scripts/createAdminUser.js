const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少 Supabase 环境变量');
  console.log('请确保设置了以下环境变量:');
  console.log('- SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// 使用 Service Role Key 创建客户端，可以绕过 RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  try {
    console.log('🔄 正在创建管理员账号...');
    
    const email = 'admin@admin.com';
    const password = 'adminadmin';
    const fullName = 'Administrator';
    
    // 先检查用户是否已经存在
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ 检查现有用户失败:', listError.message);
      return;
    }
    
    const existingUser = existingUsers.users.find(user => user.email === email);
    
    if (existingUser) {
      console.log('ℹ️  管理员账号已存在');
      console.log('📧 邮箱:', email);
      console.log('🔑 密码:', password);
      console.log('👤 姓名:', fullName);
      console.log('🆔 用户ID:', existingUser.id);
      
      // 检查 users 表中是否有记录
      const { data: userRecord, error: userCheckError } = await supabase
        .from('users')
        .select('*')
        .eq('id', existingUser.id)
        .single();
      
      if (userCheckError && userCheckError.code !== 'PGRST116') {
        console.error('❌ 检查用户记录失败:', userCheckError.message);
        return;
      }
      
      if (!userRecord) {
        console.log('🔄 用户记录不存在，正在创建...');
        
        const { data: userData, error: userError } = await supabase
          .from('users')
          .insert([
            {
              id: existingUser.id,
              email: email,
              full_name: fullName,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ])
          .select();
        
        if (userError) {
          console.error('❌ 创建用户记录失败:', userError.message);
          return;
        }
        
        console.log('✅ 用户记录创建成功');
      } else {
        console.log('✅ 用户记录已存在');
      }
      
      return;
    }
    
    // 使用 Service Role 创建用户
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      user_metadata: {
        full_name: fullName
      },
      email_confirm: true // 自动确认邮箱
    });
    
    if (authError) {
      console.error('❌ 创建认证用户失败:', authError.message);
      return;
    }
    
    console.log('✅ 认证用户创建成功:', authData.user.id);
    
    // 在 users 表中创建用户记录
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email: email,
          full_name: fullName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select();
    
    if (userError) {
      console.error('❌ 创建用户记录失败:', userError.message);
      return;
    }
    
    console.log('✅ 用户记录创建成功');
    console.log('📧 邮箱:', email);
    console.log('🔑 密码:', password);
    console.log('👤 姓名:', fullName);
    console.log('🆔 用户ID:', authData.user.id);
    
  } catch (error) {
    console.error('❌ 创建管理员账号时发生错误:', error.message);
  }
}

// 运行脚本
createAdminUser(); 