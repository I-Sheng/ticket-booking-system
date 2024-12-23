import express from 'express';
import { listTickets, listTicketsByActivity } from '../../database/tickets/get';
import { deleteTicket } from '../../database/tickets/delete';
import { createTicket} from '../../database/tickets/post';
import { updateTicket } from '../../database/tickets/update';

const router = express.Router();

// Create a new ticket
router.post('/create', async (req, res) => {
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

// List tickets for a user
router.get('/list', async (req, res) => {
  try {
    const { user_id } = req.query;
    const result = await listTickets(user_id as string);

    if ('error' in result) {
      return res.status(404).json({ error: result.error });
    }
    return res.status(200).json({ tickets: result });
  } catch (error) {
    console.error('Error in GET /tickets/list:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// List tickets for an activity
router.get('/list-by-activity', async (req, res) => {
  try {
    const { activity_id } = req.query;
    const result = await listTicketsByActivity(activity_id as string);

    if ('error' in result) {
      return res.status(404).json({ error: result.error });
    }
    return res.status(200).json({ tickets: result });
  } catch (error) {
    console.error('Error in GET /tickets/list-by-activity:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update a ticket
router.patch('/update', async (req, res) => {
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

// Delete a ticket
router.delete('/delete', async (req, res) => {
  try {
    const { ticket_id } = req.body;
    const result = await deleteTicket(ticket_id);

    if ('error' in result) {
      return res.status(404).json({ error: result.error });
    }
    return res.status(200).json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /tickets/delete:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
