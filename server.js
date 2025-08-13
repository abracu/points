require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Game = require('./models/Game');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

app.get('/api/games', async (req, res) => {
  try {
    const games = await Game.find().sort({ createdAt: -1 });
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/games/:id', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/games', async (req, res) => {
  try {
    const { name, players } = req.body;
    const game = new Game({
      name,
      players: players || []
    });
    const savedGame = await game.save();
    res.status(201).json(savedGame);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/games/:id/players', async (req, res) => {
  try {
    const { name } = req.body;
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    game.players.push({ name, points: 0 });
    const updatedGame = await game.save();
    res.json(updatedGame);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/games/:id/players/:playerId/points', async (req, res) => {
  try {
    const { points } = req.body;
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    const player = game.players.id(req.params.playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    player.points = points;
    const updatedGame = await game.save();
    res.json(updatedGame);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/games/:id', async (req, res) => {
  try {
    const game = await Game.findByIdAndDelete(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json({ message: 'Game deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/games/:id/players/:playerId', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    game.players.id(req.params.playerId).remove();
    const updatedGame = await game.save();
    res.json(updatedGame);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});