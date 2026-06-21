import { getRepository } from "../database/connection";
import { User } from "../entity/User";

export class UserService {
  private static getUserRepository() {
    return getRepository(User);
  }

  // Find user by loginid
  static async findUserByLoginId(loginid: string): Promise<User | null> {
    const userRepository = this.getUserRepository();
    return await userRepository.findOne({
      where: { loginid: loginid },
    });
  }

  // Update user language preference
  static async updateLanguagePreference(
    loginid: string,
    lang_pref: string,
    updated_by: string
  ): Promise<boolean> {
    const userRepository = this.getUserRepository();

    const result = await userRepository.update(
      { loginid }, // WHERE condition
      {
        lang_pref,
        updated_by,
      } // SET values
    );

    return result.affected ? result.affected > 0 : false;
  }

  // Create new user
  static async createUser(userData: Partial<User>): Promise<User> {
    const userRepository = this.getUserRepository();
    const user = userRepository.create(userData);
    return await userRepository.save(user);
  }

  // Get user by email
  static async findUserByEmail(email: string): Promise<User | null> {
    const userRepository = this.getUserRepository();
    return await userRepository.findOne({
      where: { email_id: email },
    });
  }

  // Get all active users
  static async getActiveUsers(): Promise<User[]> {
    const userRepository = this.getUserRepository();
    return await userRepository.find({
      where: { active_flag: "1" },
    });
  }
}
