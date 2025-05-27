import { supabaseService } from '../src/services/supabaseService'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

async function testSupabaseConnection() {
  console.log('🔄 测试 Supabase 连接...')
  
  try {
    // 测试健康检查
    const health = await supabaseService.healthCheck()
    
    if (health.healthy) {
      console.log('✅ Supabase 连接成功！')
      
      // 测试获取分类
      console.log('🔄 测试获取分类...')
      const { data: categories, error: categoriesError } = await supabaseService.getCategories()
      
      if (categoriesError) {
        console.error('❌ 获取分类失败:', categoriesError)
      } else {
        console.log(`✅ 成功获取 ${categories?.length || 0} 个分类`)
        if (categories && categories.length > 0) {
          console.log('分类列表:', categories.map(c => c.name).join(', '))
        }
      }
      
      // 测试获取统计数据
      console.log('🔄 测试获取统计数据...')
      const { data: stats, error: statsError } = await supabaseService.getDashboardStats()
      
      if (statsError) {
        console.error('❌ 获取统计数据失败:', statsError)
      } else {
        console.log('✅ 成功获取统计数据:', stats)
      }
      
    } else {
      console.error('❌ Supabase 连接失败:', health.error)
    }
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error)
  }
}

// 运行测试
if (require.main === module) {
  testSupabaseConnection().then(() => {
    console.log('🎉 测试完成')
    process.exit(0)
  }).catch((error) => {
    console.error('测试失败:', error)
    process.exit(1)
  })
} 
 