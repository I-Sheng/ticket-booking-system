// import { query } from '../database'

// type Arena = {
//   id: string;
//   title: string;
//   address: string;
//   capacity: number;
// };

// type GetArenasResult = Arena[] | { error: string };

// export async function getArenas(): Promise<GetArenasResult> {
//   const qstring = 'SELECT * FROM arenas';
//   try {
//     const res = await query(qstring, []);
//     if (res.rowCount === 0) {
//       return { error: 'No arenas found' };
//     }
//     return res.rows.map((row) => ({
//       id: row._id,
//       title: row.title,
//       address: row.address,
//       capacity: row.capacity,
//     }));
//   } catch (error) {
//     console.error('Error querying arenas:', error);
//     return { error: 'Error querying arenas' };
//   }
// }


import { query } from '../database';

export async function listArenas() {
  const qstring = `
    SELECT * FROM arenas;
  `;

  try {
    const result = await query(qstring,[]);
    return result.rows;
  } catch (error) {
    console.error('Error listing arenas:', error);
    return { error: 'Failed to fetch arenas' };
  }
}

export async function getArenaById(arena_id: string) {
  const qstring = `
    SELECT * FROM arenas WHERE _id = $1;
  `;

  try {
    const result = await query(qstring, [arena_id]);
    if (result.rowCount === 0) {
      return { error: 'Arena not found' };
    }
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching arena by ID:', error);
    return { error: 'Failed to fetch arena' };
  }
}
