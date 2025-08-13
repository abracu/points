import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  players: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    points: {
      type: Number,
      default: 0
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

gameSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Solución robusta para evitar OverwriteModelError en hot reload/entornos serverless
let Game;
if (mongoose.models.Game) {
  Game = mongoose.model('Game');
} else {
  Game = mongoose.model('Game', gameSchema);
}
export default Game;
