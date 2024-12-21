import { query } from '../database';

export async function listRegions(activity_id: string) {
  const qstring = `
    SELECT * FROM regions WHERE activity_id = $1;
  `;

  try {
    const result = await query(qstring, [activity_id]);

    if (result.rowCount === 0) {
      return { error: 'No regions found for the given activity' };
    }
    return result.rows;
  } catch (error) {
    console.error('Error listing regions:', error);
    return { error: 'Failed to fetch regions' };
  }
}
