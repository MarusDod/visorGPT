import { PopulatedToken } from "./middleware";

declare global {
  namespace Express {
    interface Request {
      context: {
        token?: PopulatedToken;
      };
    }
  }
}
