import { query } from '../database';

export async function deleteRegion(region_id: string) {
  const qstring = `
    DELETE FROM regions WHERE _id = $1 RETURNING *;
  `;

  try {
    const result = await query(qstring, [region_id]);
    if (result.rowCount === 0) {
      return { error: 'Region not found' };
    }
    return { message: 'Region deleted successfully' };
  } catch (error) {
    console.error('Error deleting region:', error);
    return { error: 'Failed to delete region' };
  }
}
