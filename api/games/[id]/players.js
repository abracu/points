import dbConnect from '../../../lib/db.js';
import Game from '../../../lib/Game.js';

export default async function handler(req, res) {
  await dbConnect();
  let { id } = req.query;
if (Array.isArray(id)) id = id[0];

  if (req.method === 'PUT') {
    try {
      const { name } = req.body;
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
      game.players.push({ name, points: 0 });
      const updatedGame = await game.save();
      res.status(200).json(updatedGame);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
