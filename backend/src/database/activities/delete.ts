import { query } from '../database';

export async function deleteActivity(activity_id: string) {
  const qstring = `
    DELETE FROM activities WHERE _id = $1 RETURNING *;
  `;

  try {
    const result = await query(qstring, [activity_id]);
    if (result.rowCount === 0) {
      return { error: 'Activity not found' };
    }
    return { message: 'Activity deleted successfully' };
  } catch (error) {
    console.error('Error deleting activity:', error);
    return { error: 'Failed to delete activity' };
  }
}
