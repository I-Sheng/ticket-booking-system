import express from 'express';
import { listArenas, getArenaById } from '../../database/arenas/get';
import { createArena } from '../../database/arenas/post';
import { updateArena } from '../../database/arenas/update';
import { deleteArena } from '../../database/arenas/delete';

const router = express.Router();

// Create a new arena
router.post('/create', async (req, res) => {
  try {
    const result = await createArena(req.body);

    if ('error' in result) {
      return res.status(400).json({ error: result.error });
    }
    return res.status(201).json({ message: 'Arena created successfully', arena: result });
  } catch (error) {
    console.error('Error in POST /arenas/create:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// List all arenas
router.get('/list', async (req, res) => {
  try {
    const result = await listArenas();

    return res.status(200).json({ arenas: result });
  } catch (error) {
    console.error('Error in GET /arenas/list:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get arena information by arena_id
router.get('/arena/:arena_id', async (req, res) => {
  try {
    const { arena_id } = req.params;
    const result = await getArenaById(arena_id);

    if ('error' in result) {
      return res.status(404).json({ error: result.error });
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in GET /arenas/arena/:arena_id:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update an arena
router.patch('/update', async (req, res) => {
  try {
    const result = await updateArena(req.body);

    if ('error' in result) {
      return res.status(404).json({ error: result.error });
    }
    return res.status(200).json({ message: 'Arena updated successfully', arena: result });
  } catch (error) {
    console.error('Error in PATCH /arenas/update:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete an arena
router.delete('/delete', async (req, res) => {
  try {
    const { arena_id } = req.body;
    const result = await deleteArena(arena_id);

    if ('error' in result) {
      return res.status(404).json({ error: result.error });
    }
    return res.status(200).json({ message: 'Arena deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /arenas/delete:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
