const { Schema, model } = require('mongoose');

const opts = {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
};

const courseSchema = new Schema(
    {
        title: { type: String, required: true },
        price: { type: Number, required: true },
        img: { type: String, required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User' }
    },
    opts
);

module.exports = model('Course', courseSchema);
