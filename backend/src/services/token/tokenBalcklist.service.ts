import redisClient from "../../config/redis.ts";
import logger from "../../config/logger.ts";
import type { ITokenBlackListService } from "./interface.ts";

export class TokenBlacklistService implements ITokenBlackListService {
  private readonly _Prefix = "blacklist:";

  async addToBlackList(token: string, expiryIn: number): Promise<void> {
    try {
      const key = this._Prefix + token;
      await redisClient.setEx(key, expiryIn, "true");
      logger.info("Token added tp blacklist", { tokenPrifix: token.substring(0, 10) });
    } catch (error) {
      logger.error("failed to add token to blackList", { error });
      throw new Error("Failed tp blacklist Token");
    }
  }

  async isBlackListed(token: string): Promise<boolean> {
    try {
      const key = this._Prefix + token;
      const result = await redisClient.get(key);
      return result === "true";
    } catch (error) {
      logger.error("Failed tp check token blacklist", { error });
      return false;
    }
  }

  async removeFromBlacklist(token: string): Promise<void> {
    try {
      const key = this._Prefix + token;
      await redisClient.del(key);
      logger.info("Token removed balcklist");
    } catch (error) {
      logger.error("Failed to remove token from balckList", error);
    }
  }
}

export const tokenBlacklistService = new TokenBlacklistService();
