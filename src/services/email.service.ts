import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export class EmailService {
  /**
   * Sends an order status update email to the customer.
   * Fire-and-forget: failures are logged, never thrown, so they
   * can't block the admin status-update request.
   */
  static async sendOrderStatusEmail(
    to: string,
    name: string,
    orderId: string,
    status: string
  ) {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
      console.warn("[EmailService] SMTP not configured, skipping email.");
      return false;
    }

    const statusMessages: Record<string, string> = {
      SHIPPED: "Your order is on its way!",
      DELIVERED: "Your order has been delivered!",
    };

    const subject = statusMessages[status] || `Order status updated: ${status}`;

    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject: `CureCart - ${subject}`,
        html: `
          <p>Hi ${name || "there"},</p>
          <p>Your order <strong>#${orderId}</strong> status has been updated to
          <strong>${status}</strong>.</p>
          <p>Thank you for shopping with CureCart!</p>
        `,
      });

      console.log(`[EmailService] Sent ${status} email to ${to}`);
      return true;
    } catch (error) {
      console.warn(`[EmailService] Failed to send email to ${to}:`, error);
      return false;
    }
  }
}
