import mongoose from 'mongoose';

const WebColorConfigSchema = new mongoose.Schema({
  primaryColor: { type: String, default: '#C62828' },
  secondaryColor: { type: String, default: '#FFFFFF' },
  accentColor: { type: String, default: '#81D4FA' },
  backgroundColor: { type: String, default: '#F0F4F8' },
  textColor: { type: String, default: '#263238' }
}, 
{ 
  timestamps: true,
  versionKey: false
});

export default mongoose.model('WebColorConfig', WebColorConfigSchema);