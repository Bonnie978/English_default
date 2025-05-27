import { Router } from 'express'
import { supabaseService } from '../services/supabaseService'

const router = Router()

// 健康检查
router.get('/health', async (req, res) => {
  try {
    const health = await supabaseService.healthCheck()
    res.json(health)
  } catch (error) {
    res.status(500).json({ healthy: false, error: 'Health check failed' })
  }
})

// 获取统计数据
router.get('/stats', async (req, res) => {
  try {
    const { data, error } = await supabaseService.getDashboardStats()
    
    if (error) {
      return res.status(400).json({ error })
    }
    
    res.json({ data })
  } catch (error) {
    res.status(500).json({ error: 'Failed to get stats' })
  }
})

// 单词管理
router.get('/words', async (req, res) => {
  try {
    const { category_id, difficulty_level, limit, offset } = req.query
    
    const filters = {
      category_id: category_id as string,
      difficulty_level: difficulty_level ? parseInt(difficulty_level as string) : undefined,
      limit: limit ? parseInt(limit as string) : 50,
      offset: offset ? parseInt(offset as string) : 0
    }
    
    const { data, error } = await supabaseService.getWords(filters)
    
    if (error) {
      return res.status(400).json({ error })
    }
    
    res.json({ data })
  } catch (error) {
    res.status(500).json({ error: 'Failed to get words' })
  }
})

router.post('/words', async (req, res) => {
  try {
    const wordData = req.body
    const { data, error } = await supabaseService.createWord(wordData)
    
    if (error) {
      return res.status(400).json({ error })
    }
    
    res.status(201).json({ data })
  } catch (error) {
    res.status(500).json({ error: 'Failed to create word' })
  }
})

router.post('/words/bulk', async (req, res) => {
  try {
    const { words } = req.body
    const { data, error } = await supabaseService.bulkCreateWords({ words })
    
    if (error) {
      return res.status(400).json({ error })
    }
    
    res.status(201).json({ data })
  } catch (error) {
    res.status(500).json({ error: 'Failed to bulk create words' })
  }
})

router.put('/words/:id', async (req, res) => {
  try {
    const { id } = req.params
    const wordData = req.body
    const { error } = await supabaseService.updateWord(id, wordData)
    
    if (error) {
      return res.status(400).json({ error })
    }
    
    res.json({ message: 'Word updated successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update word' })
  }
})

router.delete('/words/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { error } = await supabaseService.deleteWord(id)
    
    if (error) {
      return res.status(400).json({ error })
    }
    
    res.json({ message: 'Word deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete word' })
  }
})

// 分类管理
router.get('/categories', async (req, res) => {
  try {
    const { data, error } = await supabaseService.getCategories()
    
    if (error) {
      return res.status(400).json({ error })
    }
    
    res.json({ data })
  } catch (error) {
    res.status(500).json({ error: 'Failed to get categories' })
  }
})

router.post('/categories', async (req, res) => {
  try {
    const categoryData = req.body
    const { data, error } = await supabaseService.createCategory(categoryData)
    
    if (error) {
      return res.status(400).json({ error })
    }
    
    res.status(201).json({ data })
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category' })
  }
})

// 用户进度
router.get('/users/:userId/progress', async (req, res) => {
  try {
    const { userId } = req.params
    const { wordId } = req.query
    
    const { data, error } = await supabaseService.getUserProgress(userId, wordId as string)
    
    if (error) {
      return res.status(400).json({ error })
    }
    
    res.json({ data })
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user progress' })
  }
})

// 学习会话
router.post('/users/:userId/sessions', async (req, res) => {
  try {
    const { userId } = req.params
    const sessionData = { ...req.body, user_id: userId }
    
    const { data, error } = await supabaseService.createLearningSession(sessionData)
    
    if (error) {
      return res.status(400).json({ error })
    }
    
    res.status(201).json({ data })
  } catch (error) {
    res.status(500).json({ error: 'Failed to create learning session' })
  }
})

router.get('/users/:userId/sessions', async (req, res) => {
  try {
    const { userId } = req.params
    const { limit } = req.query
    
    const { data, error } = await supabaseService.getUserSessions(
      userId, 
      limit ? parseInt(limit as string) : 10
    )
    
    if (error) {
      return res.status(400).json({ error })
    }
    
    res.json({ data })
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user sessions' })
  }
})

// 用户管理
router.get('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const { data, error } = await supabaseService.getUserById(userId)
    
    if (error) {
      return res.status(400).json({ error })
    }
    
    res.json({ data })
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user' })
  }
})

router.put('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const userData = req.body
    const { error } = await supabaseService.updateUser(userId, userData)
    
    if (error) {
      return res.status(400).json({ error })
    }
    
    res.json({ message: 'User updated successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' })
  }
})

export default router 