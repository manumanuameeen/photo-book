export interface ITokenBlackListService {
  addToBlackList(token: string, expiryIn: number): Promise<void>;
  isBlackListed(token: string): Promise<boolean>;
  removeFromBlacklist(token: string): Promise<void>;
}
