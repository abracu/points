import dbConnect from '../../../lib/db';
import Game from '../../../lib/Game';

export default async function handler(req, res) {
  await dbConnect();
  let { id } = req.query;
if (Array.isArray(id)) id = id[0];


  if (req.method === 'GET') {
    try {
      if (!id || typeof id !== 'string' || id.length < 8) {
        return res.status(400).json({ error: 'Invalid game id' });
      }
      let game;
      try {
        game = await Game.findById(id);
      } catch (err) {
        return res.status(400).json({ error: 'Invalid game id format' });
      }
      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }
      res.status(200).json(game);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      if (!id || typeof id !== 'string' || id.length < 8) {
        return res.status(400).json({ error: 'Invalid game id' });
      }
      let game;
      try {
        game = await Game.findByIdAndDelete(id);
      } catch (err) {
        return res.status(400).json({ error: 'Invalid game id format' });
      }
      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }
      res.status(200).json({ message: 'Game deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
