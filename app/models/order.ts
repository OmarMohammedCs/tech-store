import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    orderItems: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                default: 1,
            },
        }
    ],
        address: { type: String, required: true },
        city: { type: String, required: true },
        phone: { type: Number, required: true },
        paymentMethod: { type: String, enum: ['cod', 'online'], required: true },
        status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered'], default: 'pending' },
        totalPrice: { type: Number, required: true },
}, { timestamps: true });

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);




export default Order;