import express from 'express';
import multer from 'multer';
import { listActivities, getActivityById} from '../../database/activities/get';
import { createActivity } from '../../database/activities/post';
import { updateActivity } from '../../database/activities/update';
import { deleteActivity } from '../../database/activities/delete';
import { jwtProtect,hostProtect } from '../middleware'

const router = express.Router();
const upload = multer()

// Create a new activity
router.post(
  '/create',
  jwtProtect,
  hostProtect,
  upload.fields([{ name: 'cover_img' }, { name: 'price_level_img' }]), // Handle image uploads
  async (req, res) => {
    try {
      const { on_sale_date, start_time, end_time, title, content, arena_id } = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const coverImg = files?.['cover_img']?.[0]?.buffer || null; // Get binary data for cover_img
      const priceLevelImg = files?.['price_level_img']?.[0]?.buffer || null; // Get binary data for price_level_img

      const result = await createActivity({
        on_sale_date,
        start_time,
        end_time,
        title,
        content,
        cover_img: coverImg,
        price_level_img: priceLevelImg,
        arena_id,
      });

      if ('error' in result) {
        return res.status(400).json({ error: result.error });
      }
      return res.status(201).json({ message: 'Activity created successfully', activity: result });
    } catch (error) {
      console.error('Error in POST /activities/create:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// // List all activities
// router.get('/list', async (req, res) => {
//   try {
//     const { arena_id } = req.query;
//     const result = await listActivities(arena_id as string);

//     if ('error' in result) {
//       return res.status(404).json({ error: result.error });
//     }
//     return res.status(200).json({ activities: result });
//   } catch (error) {
//     console.error('Error in GET /activities/list:', error);
//     return res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// // Get an activity by its ID
// router.get('/get/:activity_id', async (req, res) => {
//   try {
//     const { activity_id } = req.params;
//     const result = await getActivityById(activity_id);

//     if ('error' in result) {
//       return res.status(404).json({ error: result.error });
//     }
//     return res.status(200).json(result);
//   } catch (error) {
//     console.error('Error in GET /activities/get/:activity_id:', error);
//     return res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// List all activities
router.get('/list', async (req, res) => {
  try {
    const { arena_id } = req.query;
    const result = await listActivities(arena_id as string);

    if ('error' in result) {
      return res.status(404).json({ error: result.error });
    }

    // Process images to convert binary data into Base64
    const activitiesWithImages = result.map((activity: any) => ({
      ...activity,
      cover_img: activity.cover_img
        ? `data:image/jpeg;base64,${activity.cover_img.toString('base64')}`
        : null,
      price_level_img: activity.price_level_img
        ? `data:image/jpeg;base64,${activity.price_level_img.toString('base64')}`
        : null,
    }));

    return res.status(200).json({ activities: activitiesWithImages });
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

    // Convert binary image data to Base64
    result.cover_img = result.cover_img
      ? `data:image/jpeg;base64,${result.cover_img.toString('base64')}`
      : null;
    result.price_level_img = result.price_level_img
      ? `data:image/jpeg;base64,${result.price_level_img.toString('base64')}`
      : null;

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in GET /activities/get/:activity_id:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


// // Update an activity
// router.patch('/update',jwtProtect, hostProtect, async (req, res) => {
//   try {
//     const result = await updateActivity(req.body);

//     if ('error' in result) {
//       return res.status(404).json({ error: result.error });
//     }
//     return res.status(200).json({ message: 'Activity updated successfully', activity: result });
//   } catch (error) {
//     console.error('Error in PATCH /activities/update:', error);
//     return res.status(500).json({ error: 'Internal Server Error' });
//   }
// });


router.patch(
  '/update',
  jwtProtect,
  hostProtect,
  upload.fields([{ name: 'cover_img' }, { name: 'price_level_img' }]), // Handle image uploads
  async (req, res) => {
    try {
      const { activity_id, on_sale_date, start_time, end_time, title, content, arena_id } = req.body;

      // Extract image buffers from uploaded files
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const coverImg = files?.['cover_img']?.[0]?.buffer || null;
      const priceLevelImg = files?.['price_level_img']?.[0]?.buffer || null;

      // Pass data directly to the updateActivity function
      const result = await updateActivity({
        activity_id,
        on_sale_date,
        start_time,
        end_time,
        title,
        content,
        cover_img: coverImg,
        price_level_img: priceLevelImg,
        arena_id,
      });

      if ('error' in result) {
        return res.status(404).json({ error: result.error });
      }

      // Convert images to Base64 for response
      if (result.cover_img) {
        result.cover_img = `data:image/jpeg;base64,${result.cover_img.toString('base64')}`;
      }
      if (result.price_level_img) {
        result.price_level_img = `data:image/jpeg;base64,${result.price_level_img.toString('base64')}`;
      }

      return res.status(200).json({
        message: 'Activity updated successfully',
        activity: result,
      });
    } catch (error) {
      console.error('Error in PATCH /activities/update:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);


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
