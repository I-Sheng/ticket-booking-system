import { query } from '../database'

type Arena = {
  id: string;
  title: string;
  address: string;
  capacity: number;
};

type GetArenasResult = Arena[] | { error: string };

export async function getArenas(): Promise<GetArenasResult> {
  const qstring = 'SELECT * FROM arenas';
  try {
    const res = await query(qstring, []);
    if (res.rowCount === 0) {
      return { error: 'No arenas found' };
    }
    return res.rows.map((row) => ({
      id: row._id,
      title: row.title,
      address: row.address,
      capacity: row.capacity,
    }));
  } catch (error) {
    console.error('Error querying arenas:', error);
    return { error: 'Error querying arenas' };
  }
}

