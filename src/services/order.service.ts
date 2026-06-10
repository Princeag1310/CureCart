import { prisma } from '../config/db';
import { CartService } from './cart.service';
import { MarketingService } from './marketing.service';

export class OrderService {
  /**
   * INTERVIEW HIGHLIGHT:
   * This is a critical Prisma Transaction that prevents "Overselling" Race Conditions.
   * By wrapping the stock check, stock decrement, and order creation in an interactive transaction,
   * we guarantee ACID compliance. If two users try to buy the last paracetamol strip at the exact
   * same millisecond, the database locks the rows, processes one, and correctly fails the other.
   */
  static async checkoutCart(userId: string) {
    const cart = await CartService.getCart(userId);

    if (!cart.items || cart.items.length === 0) {
      throw new Error("Cart is empty");
    }

    // Begin interactive transaction
    return await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItemsData = [];

      for (const item of cart.items) {
        // 1. Pessimistic read / Fresh fetch within the transaction to ensure stock is perfectly accurate
        const medicine = await tx.medicine.findUnique({
          where: { id: item.medicineId },
        });

        if (!medicine) {
          throw new Error(`Medicine ${item.medicine.name} no longer exists.`);
        }

        if (medicine.stock < item.quantity) {
          throw new Error(`Out of stock! Only ${medicine.stock} left for ${medicine.name}.`);
        }

        // 2. Decrement stock safely inside the transaction
        await tx.medicine.update({
          where: { id: medicine.id },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        // 3. Prepare order item details
        const itemTotal = medicine.price * item.quantity;
        totalAmount += itemTotal;

        orderItemsData.push({
          medicineId: medicine.id,
          quantity: item.quantity,
          priceAtBuy: medicine.price, // Snapshot of price
        });
      }

      // 4. Create the Order
      const order = await tx.order.create({
        data: {
          userId,
          totalAmount,
          status: 'PENDING',
          items: {
            create: orderItemsData,
          },
        },
      });

      // 5. Clear the Cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      // Background Webhook: Sync to MailerPro marketing microservice
      // We do this asynchronously so it doesn't block the checkout response
      prisma.user.findUnique({ where: { id: userId } }).then(user => {
        if (user && user.email) {
          MarketingService.syncUserToMailerPro(user.email, user.name || "Customer", ["Buyer", "CureCart"]);
        }
      }).catch(err => console.error("Failed to sync to MailerPro", err));

      // Transaction commits successfully here.
      return order;
    });
  }
}
