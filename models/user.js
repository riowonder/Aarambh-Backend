import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  serial_no: {
    type: String,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  dob: {
    type: Date
  },
  phone_number: {
    type: String,
    trim: true
  },
  aadhar_number: {
    type: String,
    trim: true,
    sparse: true
  },
  height: {
    type: Number,
    trim: true
  },
  weight: {
    type: Number,
    trim: true
  },
  gender: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    default: '',
    trim: true
  },
  age: {
    type: Number,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  blood_group: {
    type: String,
    trim: true
  },
  subscriptions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    default: []
  }],
  gym_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  is_approved: {
    type: Boolean,
    default: false
  },
  is_banned: {
    type: Boolean,
    default: false
  }
}, { timestamps: true, strict: false });

// Compound unique index for serial_no within a gym
userSchema.index({ gym_id: 1, serial_no: 1 }, { unique: true });

userSchema.index(
  { aadhar_number: 1 },
  {
    unique: true,
    partialFilterExpression: {
      aadhar_number: { $exists: true, $ne: null }
    }
  }
);

const User = mongoose.model('User', userSchema);
export default User;