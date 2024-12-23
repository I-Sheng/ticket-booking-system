import express from 'express';
import { listActivities, getActivityById} from '../../database/activities/get';
import { createActivity } from '../../database/activities/post';
import { updateActivity } from '../../database/activities/update';
import { deleteActivity } from '../../database/activities/delete';
import { jwtProtect,hostProtect } from '../middleware'

const router = express.Router();

// Create a new activity
router.post('/create',jwtProtect, hostProtect, async (req, res) => {
  try {
    const result = await createActivity(req.body);

    if ('error' in result) {
      return res.status(400).json({ error: result.error });
    }
    return res.status(201).json({ message: 'Activity created successfully', activity: result });
  } catch (error) {
    console.error('Error in POST /activities/create:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// List all activities
router.get('/list', async (req, res) => {
  try {
    const { arena_id } = req.query;
    const result = await listActivities(arena_id as string);

    if ('error' in result) {
      return res.status(404).json({ error: result.error });
    }
    return res.status(200).json({ activities: result });
  } catch (error) {
    console.error('Error in GET /activities/list:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get an activity by its ID
router.get('/get/:activity_id', async (req, res) => {
  try {
    const { activity_id } = req.params;
    const result = await getActivityById(activity_id);

    if ('error' in result) {
      return res.status(404).json({ error: result.error });
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in GET /activities/get/:activity_id:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update an activity
router.patch('/update',jwtProtect, hostProtect, async (req, res) => {
  try {
    const result = await updateActivity(req.body);

    if ('error' in result) {
      return res.status(404).json({ error: result.error });
    }
    return res.status(200).json({ message: 'Activity updated successfully', activity: result });
  } catch (error) {
    console.error('Error in PATCH /activities/update:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete an activity
router.delete('/delete',jwtProtect, hostProtect, async (req, res) => {
  try {
    const { activity_id } = req.body;

    if (!activity_id) {
      return res.status(400).json({ error: 'activity_id is required' });
    }

    const result = await deleteActivity(activity_id);

    if ('error' in result) {
      return res.status(404).json({ error: result.error });
    }
    return res.status(200).json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /activities/delete:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
