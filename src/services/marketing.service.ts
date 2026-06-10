export class MarketingService {
  /**
   * Syncs a user to the MailerPro Marketing SaaS.
   * This is part of the Event-Driven Microservice Architecture.
   * 
   * @param email The user's email address
   * @param name The user's full name
   * @param tags Array of tags (e.g. ['Buyer', 'New User', 'Refill Needed'])
   */
  static async syncUserToMailerPro(email: string, name: string, tags: string[] = []) {
    // In production, this URL would be an environment variable.
    // For local dev, we assume MailerPro is running on port 5000.
    const MAILER_PRO_URL = process.env.MAILER_PRO_API_URL || 'http://localhost:5000/api/contacts';

    try {
      console.log(`[MarketingService] Syncing ${email} to MailerPro with tags: ${tags.join(', ')}`);
      
      const response = await fetch(MAILER_PRO_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // In a real app, you would pass an API key here
          // 'Authorization': `Bearer ${process.env.MAILER_PRO_API_KEY}`
        },
        body: JSON.stringify({
          name,
          email,
          tags,
          source: 'CureCart Integration',
          subscribed: true
        })
      });

      if (!response.ok) {
        console.warn(`[MarketingService] MailerPro returned ${response.status}. Is it running?`);
        return false;
      }

      console.log(`[MarketingService] Successfully synced ${email} to MailerPro!`);
      return true;
    } catch (error) {
      console.warn(`[MarketingService] Failed to connect to MailerPro. Ensure the microservice is running on port 5000. Error:`, error);
      return false;
    }
  }
}
