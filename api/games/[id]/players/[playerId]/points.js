// IMPORT CORRECTO: 4 niveles arriba hasta lib/
import dbConnect from '../../../../../lib/db.js';
import Game from '../../../../../lib/Game.js';

export default async function handler(req, res) {
  try {
    await dbConnect();
    let { id, playerId } = req.query;
    if (Array.isArray(id)) id = id[0];
    if (Array.isArray(playerId)) playerId = playerId[0];

    if (req.method === 'PUT') {
      const { points } = req.body;
      if (!id || typeof id !== 'string' || id.length < 8) {
        return res.status(400).json({ error: 'Invalid game id' });
      }
      if (!playerId || typeof playerId !== 'string' || playerId.length < 8) {
        return res.status(400).json({ error: 'Invalid player id' });
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
      const player = game.players.id(playerId);
      if (!player) {
        return res.status(404).json({ error: 'Player not found' });
      }
      player.points = points;
      const updatedGame = await game.save();
      return res.status(200).json(updatedGame);
    }

    res.setHeader('Allow', ['PUT']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (error) {
    console.error('API ERROR /points:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid id format' });
    }
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

