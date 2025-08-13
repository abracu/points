import dbConnect from '../../../../../../lib/db';
import Game from '../../../../../../lib/Game';

export default async function handler(req, res) {
  await dbConnect();
  const { id, playerId } = req.query;

  if (req.method === 'PUT') {
    try {
      const { points } = req.body;
      const game = await Game.findById(id);
      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }
      const player = game.players.id(playerId);
      if (!player) {
        return res.status(404).json({ error: 'Player not found' });
      }
      player.points = points;
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
