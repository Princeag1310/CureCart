import { prisma } from '../config/db';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export class AuthService {
  /**
   * Hashes a plain text password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * Compares a plain text password with a hashed password
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Register a new user in the database
   */
  static async registerUser(email: string, passwordPlain: string, name?: string) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    const hashedPassword = await this.hashPassword(passwordPlain);

    if (existingUser) {
      if (!existingUser.password) {
        // Account linking: User registered via Google first, now they are setting a password
        const updatedUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: { password: hashedPassword }
        });
        const { password, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
      } else {
        // User already has an email/password account
        throw new Error('Email is already registered. Please sign in.');
      }
    }

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'USER'
      },
    });

    // Strip password from the returned object for security
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }
}
