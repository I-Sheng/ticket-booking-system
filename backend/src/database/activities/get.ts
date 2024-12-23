import { query } from '../database';

export async function listActivities(arena_id?: string) {
  let qstring = `
    SELECT * FROM activities
  `;
  const values: string[] = [];

  if (arena_id) {
    qstring += ' WHERE arena_id = $1';
    values.push(arena_id);
  }

  qstring += ' ORDER BY on_sale_date';

  try {
    const result = await query(qstring, values);

    if (result.rowCount === 0) {
      return { error: 'No activities found' };
    }
    return result.rows;
  } catch (error) {
    console.error('Error listing activities:', error);
    return { error: 'Failed to fetch activities' };
  }
}

export async function getActivityById(activity_id: string) {
  const qstring = `
    SELECT * FROM activities WHERE _id = $1;
  `;

  try {
    const result = await query(qstring, [activity_id]);

    if (result.rowCount === 0) {
      return { error: 'Activity not found' };
    }
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching activity:', error);
    return { error: 'Failed to fetch activity' };
  }
}
