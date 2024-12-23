import { query } from '../database';

export async function deleteArena(arena_id: string) {
  const qstring = `
    DELETE FROM arenas WHERE _id = $1 RETURNING *;
  `;

  try {
    const result = await query(qstring, [arena_id]);
    if (result.rowCount === 0) {
      return { error: 'Arena not found' };
    }
    return { message: 'Arena deleted successfully' };
  } catch (error) {
    console.error('Error deleting arena:', error);
    return { error: 'Failed to delete arena' };
  }
}
