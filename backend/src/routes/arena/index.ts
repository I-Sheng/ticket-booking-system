import express from 'express';
import { getArenas } from '../../database/arena/get';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const arenas = await getArenas();

    // 判斷返回的是否為錯誤對象
    if ('error' in arenas) {
      return res.status(404).json({ error: arenas.error });
    }

    // 返回成功結果
    return res.status(200).json(arenas);
  } catch (error) {
    console.error('Error in GET /api/arenas:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;

