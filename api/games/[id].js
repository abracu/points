import dbConnect from '../../lib/db.js';
import Game from '../../lib/Game.js';

export default async function handler(req, res) {
  console.log('Handler /api/games/[id].js invoked', req.method, req.query);
  try {
    await dbConnect();
    let { id } = req.query;
    if (Array.isArray(id)) id = id[0];

    if (!id || typeof id !== 'string' || id.length < 8) {
      return res.status(400).json({ error: 'Invalid game id' });
    }

    if (req.method === 'GET') {
      let game;
      try {
        game = await Game.findById(id);
      } catch (err) {
        return res.status(400).json({ error: 'Invalid game id format' });
      }
      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }
      return res.status(200).json(game);
    }

    if (req.method === 'DELETE') {
      let game;
      try {
        game = await Game.findByIdAndDelete(id);
      } catch (err) {
        return res.status(400).json({ error: 'Invalid game id format' });
      }
      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }
      return res.status(200).json({ message: 'Game deleted successfully' });
    }

    res.setHeader('Allow', ['GET', 'DELETE']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (error) {
    console.error('API ERROR:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid game id format' });
    }
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
