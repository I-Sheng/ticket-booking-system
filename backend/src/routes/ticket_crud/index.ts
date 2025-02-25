import express from 'express';
import { listTickets,getTicketById, listTicketsByActivity,listTicketsByRegion } from '../../database/tickets/get';
// import { deleteTicket } from '../../database/tickets/delete';
import { createTicket} from '../../database/tickets/post';
import { updateTicket } from '../../database/tickets/update';
import { getRegionById } from '../../database/regions/get';
import { jwtProtect,hostProtect } from '../middleware'

const router = express.Router();

// Create a new ticket
router.post('/create',jwtProtect, hostProtect, async (req, res) => {
  try {
    const result = await createTicket(req.body);

    if ('error' in result) {
      return res.status(400).json({ error: result.error });
    }
    return res.status(201).json({ message: 'Ticket created successfully', ticket: result });
  } catch (error) {
    console.error('Error in POST /tickets/create:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// List tickets for a user with region names
router.get('/list', jwtProtect, async (req, res) => {
  try {
    const user_id: string = req.body.decoded._id;
    const tickets = await listTickets(user_id as string);

    if ('error' in tickets) {
      return res.status(404).json({ error: tickets.error });
    }

    // Add region names to each ticket
    const ticketsWithRegion = await Promise.all(
      tickets.map(async (ticket) => {
        const region = await getRegionById(ticket.region_id);
        return {
          ...ticket,
          region_name: 'error' in region ? null : region.region_name, // Assuming region has a `name` field
        };
      })
    );

    return res.status(200).json({ tickets: ticketsWithRegion });
  } catch (error) {
    console.error('Error in GET /tickets/list:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/get/:ticket_id', jwtProtect, async (req, res) => {
  try {
    const user_id: string = req.body.decoded._id;
    const { ticket_id } = req.params;

    const ticket = await getTicketById(ticket_id, user_id);

    // If no ticket is found, return a neutral response
    if (!ticket) {
      return res.status(200).json({ ticket: null, message: 'No ticket found for this user' });
    }

    // Add region name to the ticket
    const region = await getRegionById(ticket.region_id);
    const ticketWithRegion = {
      ...ticket,
      region_name: 'error' in region ? null : region.region_name,
    };

    return res.status(200).json({ ticket: ticketWithRegion });
  } catch (error) {
    console.error('Error in GET /tickets/get/:ticket_id:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// List tickets for an activity with optional is_paid filter
router.get('/list-by-activity', jwtProtect, hostProtect, async (req, res) => {
  try {
    const { activity_id, is_paid } = req.query;

    if (!activity_id) {
      return res.status(400).json({ error: 'Missing activity_id' });
    }

    const result = await listTicketsByActivity(activity_id as string, is_paid as string | undefined);

    if ('error' in result) {
      return res.status(404).json({ error: result.error });
    }
    return res.status(200).json({ tickets: result });
  } catch (error) {
    console.error('Error in GET /tickets/list-by-activity:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// List tickets for an activity and region with optional is_paid filter
router.get('/list-by-region', jwtProtect, hostProtect, async (req, res) => {
  try {
    const { region_id, is_paid } = req.query;

    if (!region_id) {
      return res.status(400).json({ error: 'Missing region_id' });
    }

    const result = await listTicketsByRegion(region_id as string, is_paid as boolean | undefined);

    if ('error' in result) {
      return res.status(404).json({ error: result.error });
    }
    return res.status(200).json({ tickets: result });
  } catch (error) {
    console.error('Error in GET /tickets/list-by-activity-and-region:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update a ticket
router.patch('/update',jwtProtect, hostProtect, async (req, res) => {
  try {
    const result = await updateTicket(req.body);

    if ('error' in result) {
      return res.status(404).json({ error: result.error });
    }
    return res.status(200).json({ message: 'Ticket updated successfully', ticket: result });
  } catch (error) {
    console.error('Error in PATCH /tickets/update:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// // Delete a ticket
// router.delete('/delete',jwtProtect, hostProtect, async (req, res) => {
//   try {
//     const { ticket_id } = req.body;
//     const result = await deleteTicket(ticket_id);
//
//     if ('error' in result) {
//       return res.status(404).json({ error: result.error });
//     }
//     return res.status(200).json({ message: 'Ticket deleted successfully' });
//   } catch (error) {
//     console.error('Error in DELETE /tickets/delete:', error);
//     return res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

export default router;
