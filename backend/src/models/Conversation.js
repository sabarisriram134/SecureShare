import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  messages: [
    {
      id: String,
      sender: {
        type: String,
        enum: ['user', 'assistant'],
        required: true
      },
      text: {
        type: String,
        required: true
      },
      intent: {
        type: String,
        enum: ['UPLOAD', 'DOWNLOAD', 'SHARE', 'DELETE', 'SEARCH', 'HELP', 'UNKNOWN'],
        default: 'UNKNOWN'
      },
      confidence: {
        type: Number,
        default: 0
      },
      entities: {
        filenames: [String],
        users: [String],
        dates: [String]
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  ],

  // Store the last intent for context
  lastIntent: {
    type: String,
    default: null
  },

  // Conversation metadata
  title: String,
  isActive: {
    type: Boolean,
    default: true
  },

  startedAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Update timestamp on save
conversationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient querying
conversationSchema.index({ userId: 1, updatedAt: -1 });

export default mongoose.model('Conversation', conversationSchema);
