import mongoose from 'mongoose'
import { supabaseService } from '../src/services/supabaseService'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

// MongoDB 模型定义（假设的现有结构）
interface MongoWord {
  _id: mongoose.Types.ObjectId
  english: string
  chinese: string
  pronunciation?: string
  difficulty?: number
  category?: string
  audioUrl?: string
  exampleSentence?: string
  createdAt: Date
  updatedAt: Date
}

interface MongoUser {
  _id: mongoose.Types.ObjectId
  email: string
  fullName?: string
  avatarUrl?: string
  createdAt: Date
  updatedAt: Date
}

interface MongoUserProgress {
  _id: mongoose.Types.ObjectId
  userId: string
  wordId: string
  masteryLevel: number
  lastReviewed: Date
  reviewCount: number
  correctCount: number
  createdAt: Date
  updatedAt: Date
}

// 创建 MongoDB 模式
const wordSchema = new mongoose.Schema({
  english: String,
  chinese: String,
  pronunciation: String,
  difficulty: Number,
  category: String,
  audioUrl: String,
  exampleSentence: String,
  createdAt: Date,
  updatedAt: Date
})

const userSchema = new mongoose.Schema({
  email: String,
  fullName: String,
  avatarUrl: String,
  createdAt: Date,
  updatedAt: Date
})

const userProgressSchema = new mongoose.Schema({
  userId: String,
  wordId: String,
  masteryLevel: Number,
  lastReviewed: Date,
  reviewCount: Number,
  correctCount: Number,
  createdAt: Date,
  updatedAt: Date
})

const WordModel = mongoose.model('Word', wordSchema)
const UserModel = mongoose.model('User', userSchema)
const UserProgressModel = mongoose.model('UserProgress', userProgressSchema)

class DataMigration {
  private categoryMap: Map<string, string> = new Map()

  async connectMongoDB() {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vocabulary'
    await mongoose.connect(mongoUri)
    console.log('✅ 已连接到 MongoDB')
  }

  async disconnectMongoDB() {
    await mongoose.disconnect()
    console.log('✅ 已断开 MongoDB 连接')
  }

  async migrateCategories() {
    console.log('🔄 开始迁移分类...')
    
    // 获取所有唯一的分类
    const categories = await WordModel.distinct('category')
    
    // 获取现有的 Supabase 分类
    const { data: existingCategories } = await supabaseService.getCategories()
    const existingCategoryNames = new Set(existingCategories?.map(c => c.name) || [])

    for (const categoryName of categories) {
      if (!categoryName || existingCategoryNames.has(categoryName)) {
        continue
      }

      const { data: category, error } = await supabaseService.createCategory({
        name: categoryName,
        description: `从 MongoDB 迁移的分类: ${categoryName}`,
        color: this.getRandomColor()
      })

      if (error) {
        console.error(`❌ 创建分类失败: ${categoryName}`, error)
      } else if (category) {
        this.categoryMap.set(categoryName, category.id)
        console.log(`✅ 已创建分类: ${categoryName}`)
      }
    }

    // 更新分类映射
    if (existingCategories) {
      for (const category of existingCategories) {
        this.categoryMap.set(category.name, category.id)
      }
    }

    console.log('✅ 分类迁移完成')
  }

  async migrateWords() {
    console.log('🔄 开始迁移单词...')
    
    const words = await WordModel.find({}).lean() as unknown as MongoWord[]
    const batchSize = 100
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < words.length; i += batchSize) {
      const batch = words.slice(i, i + batchSize)
      const wordsToCreate = batch.map(word => ({
        english: word.english,
        chinese: word.chinese,
        pronunciation: word.pronunciation,
        difficulty_level: word.difficulty || 1,
        category_id: word.category ? this.categoryMap.get(word.category) || undefined : undefined,
        audio_url: word.audioUrl,
        example_sentence: word.exampleSentence
      }))

      const { data, error } = await supabaseService.bulkCreateWords({ words: wordsToCreate })
      
      if (error) {
        console.error(`❌ 批量创建单词失败 (批次 ${Math.floor(i / batchSize) + 1}):`, error)
        errorCount += batch.length
      } else {
        successCount += data?.length || 0
        console.log(`✅ 已迁移 ${data?.length || 0} 个单词 (批次 ${Math.floor(i / batchSize) + 1})`)
      }
    }

    console.log(`✅ 单词迁移完成: 成功 ${successCount}, 失败 ${errorCount}`)
  }

  async migrateUsers() {
    console.log('🔄 开始迁移用户...')
    
    const users = await UserModel.find({}).lean() as unknown as MongoUser[]
    let successCount = 0
    let errorCount = 0

    for (const user of users) {
      const { data, error } = await supabaseService.createUser({
        id: user._id.toString(),
        email: user.email,
        full_name: user.fullName,
        avatar_url: user.avatarUrl
      })

      if (error) {
        console.error(`❌ 创建用户失败: ${user.email}`, error)
        errorCount++
      } else {
        successCount++
        console.log(`✅ 已迁移用户: ${user.email}`)
      }
    }

    console.log(`✅ 用户迁移完成: 成功 ${successCount}, 失败 ${errorCount}`)
  }

  async migrateUserProgress() {
    console.log('🔄 开始迁移用户进度...')
    
    const progressRecords = await UserProgressModel.find({}).lean() as unknown as MongoUserProgress[]
    let successCount = 0
    let errorCount = 0

    // 注意：这里需要映射 MongoDB 的 ObjectId 到 Supabase 的 UUID
    // 实际实现中可能需要建立 ID 映射表
    
    for (const progress of progressRecords) {
      // 这里需要根据实际情况映射用户ID和单词ID
      // 暂时跳过，因为需要建立完整的ID映射关系
      console.log(`⚠️  跳过用户进度迁移，需要建立ID映射关系`)
      break
    }

    console.log(`✅ 用户进度迁移完成: 成功 ${successCount}, 失败 ${errorCount}`)
  }

  private getRandomColor(): string {
    const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16']
    return colors[Math.floor(Math.random() * colors.length)]
  }

  async run() {
    try {
      console.log('🚀 开始数据迁移...')
      
      // 检查 Supabase 连接
      const health = await supabaseService.healthCheck()
      if (!health.healthy) {
        throw new Error(`Supabase 连接失败: ${health.error}`)
      }
      console.log('✅ Supabase 连接正常')

      // 连接 MongoDB
      await this.connectMongoDB()

      // 执行迁移
      await this.migrateCategories()
      await this.migrateWords()
      await this.migrateUsers()
      await this.migrateUserProgress()

      console.log('🎉 数据迁移完成！')
      
    } catch (error) {
      console.error('❌ 迁移失败:', error)
    } finally {
      await this.disconnectMongoDB()
    }
  }
}

// 运行迁移
if (require.main === module) {
  const migration = new DataMigration()
  migration.run().then(() => {
    process.exit(0)
  }).catch((error) => {
    console.error('迁移过程中发生错误:', error)
    process.exit(1)
  })
}

export default DataMigration 