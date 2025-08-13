import dbConnect from '../../../lib/db';
import Game from '../../../lib/Game';

export default async function handler(req, res) {
  await dbConnect();
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const game = await Game.findById(id);
      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }
      res.status(200).json(game);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const game = await Game.findByIdAndDelete(id);
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
