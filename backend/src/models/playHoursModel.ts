

import mongoose, { Schema, Document } from 'mongoose';

const playHourSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        centerId: {
            type: Schema.Types.ObjectId,
            ref: 'Center',
            required: true
        },
        totalHours: {
            type: Number,
            required: true
        },
        remainingHours: {
            type: Number,
            required: true
        },
        playPackageId: [{
            type: Schema.Types.ObjectId,
            ref: 'PlayPackage',
            required: true
        }]
    },
    { timestamps: true }
);

const PlayPackage = mongoose.model('PlayHour', playHourSchema);
export default PlayPackage;
