import crypto from "crypto";
import Order from "../models/Order.js";
import Razorpay from "razorpay";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResonse.js";
import { statusType } from "../utils/statusType.js";


// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay Order
export const CheckOut = asyncHandler(async (req, res) => {
    const { orderId, amount } = req.body;

    if (!orderId || !amount) {
        return sendResponse(res, false, null, "Order ID and amount are required", statusType.BAD_REQUEST);
    }

    const order = await Order.findById(orderId);
    if (!order) {
        return sendResponse(res, false, null, "Order not found", statusType.NOT_FOUND);
    }

    const options = {
        amount: amount * 100,
        currency: "INR",
        receipt: `order_${orderId}`,
        payment_capture: 1
    };

    const razorpayOrder = await razorpay.orders.create(options);

    order.paymentDetails = {
        razorpayOrderId: razorpayOrder.id,
        status: "created"
    };
    await order.save();

    return sendResponse(res, true, {
        id: razorpayOrder.id,
        currency: razorpayOrder.currency,
        amount: razorpayOrder.amount,
        orderId: order._id
    }, "Razorpay order created successfully", statusType.OK);
});

// Webhook: Verify Payment Signature
export const VerifyPayment = asyncHandler(async (req, res) => {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        return sendResponse(res, false, null, "Payment verification failed - missing parameters", statusType.BAD_REQUEST);
    }

    const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

    if (generatedSignature !== razorpay_signature) {
        return sendResponse(res, false, null, "Payment verification failed - invalid signature", statusType.BAD_REQUEST);
    }

    const order = await Order.findOne({
        "paymentDetails.razorpayOrderId": razorpay_order_id
    });

    if (!order) {
        return sendResponse(res, false, null, "Order not found", statusType.NOT_FOUND);
    }

    order.paymentDetails = {
        ...order.paymentDetails,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "captured",
        paidAt: new Date()
    };

    await order.save();

    return sendResponse(res, true, null, "Payment verified successfully", statusType.OK);
});
