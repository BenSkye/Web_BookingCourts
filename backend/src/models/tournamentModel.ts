import mongoose from 'mongoose'
import validator from 'validator'

const tournamentSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      match: /^(\+\d{1,3}[- ]?)?\d{10}$/
    },
    email: {
      type: String,
      required: [true, 'Email không được để trống'],
      validate: [validator.isEmail, 'Email không hợp lệ']
    },
    tournamentName: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    numberOfAthletes: {
      type: Number,
      required: true
    },
    numberOfMatches: {
      type: Number,
      required: true
    },
    prizeStructure: {
      type: String,
      trim: true
    },
    sponsor: {
      type: String,
      trim: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    specialRequests: {
      type: String,
      trim: true
    },
    centerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Center' // Assuming you have a Center model
    },
    status: {
      type: String,
      enum: ['pending', 'denied', 'approved', 'Confirm', 'completed', 'cancelled'],
      default: 'Pending'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Assuming you have a User model
      required: true
    }
  },
  {
    timestamps: true
  }
)

const Tournament = mongoose.model('Tournament', tournamentSchema)
export default Tournament
