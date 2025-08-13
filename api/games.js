import dbConnect from '../lib/db.js';
import Game from '../lib/Game.js';

export default async function handler(req, res) {
  await dbConnect();
  if (req.method === 'GET') {
    try {
      const games = await Game.find().sort({ createdAt: -1 });
      res.status(200).json(games);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, players } = req.body;
      const game = new Game({ name, players: players || [] });
      const savedGame = await game.save();
      res.status(201).json(savedGame);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
