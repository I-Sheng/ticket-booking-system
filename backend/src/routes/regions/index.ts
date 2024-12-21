import express from 'express';
import { listRegions } from '../../database/regions/get';
import { createRegion } from '../../database/regions/post';
import { updateRegion } from '../../database/regions/update';
import { deleteRegion } from '../../database/regions/delete';

const router = express.Router();

// Create a new region
router.post('/create', async (req, res) => {
  try {
    const result = await createRegion(req.body);

    if ('error' in result) {
      return res.status(400).json({ error: result.error });
    }
    return res.status(201).json({ message: 'Region created successfully', region: result });
  } catch (error) {
    console.error('Error in POST /regions/create:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// List all regions for a specific activity
router.get('/list', async (req, res) => {
  try {
    const { activity_id } = req.query;

    if (!activity_id) {
      return res.status(400).json({ error: 'activity_id is required' });
    }

    const result = await listRegions(activity_id as string);

    if ('error' in result) {
      return res.status(404).json({ error: result.error });
    }
    return res.status(200).json({ regions: result });
  } catch (error) {
    console.error('Error in GET /regions/list:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update a region
router.patch('/update', async (req, res) => {
  try {
    const result = await updateRegion(req.body);

    if ('error' in result) {
      return res.status(404).json({ error: result.error });
    }
    return res.status(200).json({ message: 'Region updated successfully', region: result });
  } catch (error) {
    console.error('Error in PATCH /regions/update:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete a region
router.delete('/delete', async (req, res) => {
  try {
    const { region_id } = req.body;

    if (!region_id) {
      return res.status(400).json({ error: 'region_id is required' });
    }

    const result = await deleteRegion(region_id);

    if ('error' in result) {
      return res.status(404).json({ error: result.error });
    }
    return res.status(200).json({ message: 'Region deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /regions/delete:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
