import bcrypt from 'bcryptjs';

const ROUNDS = 10;

export const passwordService = {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, ROUNDS);
  },

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
};
