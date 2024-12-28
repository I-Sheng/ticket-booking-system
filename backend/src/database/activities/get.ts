import { query } from '../database';

export async function listActivities(arena_id?: string) {
  let qstring = `
    SELECT * FROM activities WHERE is_archived = false
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

export async function listActivitiesByCreatorId(creator_id: string) {
  const qstring = `
    SELECT * FROM activities
    WHERE creator_id = $1
    AND is_archived = false; -- Exclude archived activities
  `;
  try {
    const result = await query(qstring, [creator_id]);
    if (result.rowCount === 0) {
      return { error: 'No activities found for the given creator' };
    }
    return result.rows;
  } catch (error) {
    console.error('Error listing activities by creator_id:', error);
    return { error: 'Failed to fetch activities' };
  }
}
