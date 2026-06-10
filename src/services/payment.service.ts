import Razorpay from "razorpay";

export class PaymentService {
  private static getRazorpayInstance() {
    return new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "rzp_secret_placeholder",
    });
  }

  /**
   * Creates a Razorpay Order
   * @param amount The total amount in INR (will be converted to paise internally)
   * @param receiptId A unique identifier for the receipt (e.g. your local Order ID)
   */
  static async createOrder(amount: number, receiptId: string) {
    if (!process.env.RAZORPAY_KEY_ID) {
      console.warn("RAZORPAY_KEY_ID is missing. Mocking payment gateway order for development.");
      return {
        id: `order_mock_${Date.now()}`,
        amount: amount * 100,
        currency: "INR",
        receipt: receiptId,
      };
    }

    const instance = this.getRazorpayInstance();
    const options = {
      amount: amount * 100, // Amount is in currency subunits (paise)
      currency: "INR",
      receipt: receiptId,
    };

    try {
      const order = await instance.orders.create(options);
      return order;
    } catch (error: any) {
      console.error("Razorpay Order Creation Failed:", error);
      throw new Error("Failed to initialize payment gateway");
    }
  }
}
