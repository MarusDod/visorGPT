import express from "express";
import { GuestModel } from "../schemas/guest";
import { z } from "zod";
import { AccountDTO, AccountModel } from "../schemas/account";
import {
  checkPassword,
  hashPassword,
  objectIdSchema,
  passwordSchema,
} from "../utils";
import {
  SessionTokenDocument,
  SessionTokenModel,
} from "../schemas/session-token";
import { authMiddleware } from "../middleware";
import { GetLeanResultType } from "mongoose";

const loginRouter = express.Router();

loginRouter.get("/getGuest", async (req, res) => {
  let token: Record<string, any> | null = null;

  const tokenId = objectIdSchema.optional().parse(req.query.id);

  if (req.query.id) {
    token = await SessionTokenModel.findOne({
      _id: tokenId,
    })
      .populate("guest")
      .lean();

    if (token) {
      const account = await AccountModel.findOne({
        guest: token.guest._id,
      }).lean();

      res.cookie("authorization", token._id.toString());
      res.status(200).json({
        ...token,
        guest: {
          ...token.guest,
          account: account ? AccountDTO.parse(account) : null,
        },
      });
      return;
    }
  }

  const guest = await GuestModel.create({});
  token = await SessionTokenModel.create({ guest: guest._id });
  res.cookie("authorization", token._id.toString());

  res.json({
    ...token.toObject(),
    guest: guest.toObject(),
  });
});

loginRouter.post("/login", async (req, res) => {
  const input = z
    .object({
      email: z.string().email(),
      password: passwordSchema,
    })
    .parse(req.body);

  const account = await AccountModel.findOne({
    email: input.email,
  })
    .populate("guest")
    .lean();

  if (!account) {
    res.status(400).send("Invalid email");
    return;
  }

  if (!(await checkPassword(input.password, account.hashedPassword))) {
    res.status(400).send("InvalidCredentials");
    return;
  }

  const token = await SessionTokenModel.create({
    guest: account.guest._id,
  });

  const resp = z
    .object({
      _id: z.coerce.string(),
      guest: z.object({
        _id: z.coerce.string(),
        account: z.object({
          _id: z.coerce.string(),
          email: z.string().email(),
          name: z.string(),
        }),
      }),
    })
    .parse({
      _id: token._id,
      guest: {
        _id: account.guest._id,
        account,
      },
    });

  if (token) {
    res.cookie("authorization", token._id.toString());
    res.status(201).json(resp);
    return;
  }
});

loginRouter.post("/logout", authMiddleware, async (req, res) => {
  const tokenId = req.context.token!._id;

  try {
    await SessionTokenModel.deleteOne({ _id: tokenId });
  } catch (err) {
    console.error(err);
    res.clearCookie("authorization");
    res.status(403).send("error logging out");
    return;
  }

  res.clearCookie("authorization");

  res.status(200).send("");
});

loginRouter.post("/createAccount", authMiddleware, async (req, res) => {
  const input = z
    .object({
      name: z.string(),
      email: z.string().email(),
      password: passwordSchema,
      confirmPassword: passwordSchema,
    })
    .refine((d) => d.password === d.confirmPassword, "passwords don't match")
    .parse(req.body);

  const guestId = req.context.token!.guest._id;

  const guest = await GuestModel.countDocuments({
    _id: guestId,
  });

  if (!guest) {
    res.status(400).send("guest does not exist");
    return;
  }

  const existingAccounts = await AccountModel.countDocuments({
    guest: guestId,
  });

  if (!!existingAccounts) {
    res.status(400).send("account already exists");
    return;
  }

  const account = await AccountModel.create({
    guest: guestId,
    name: input.name,
    email: input.email,
    hashedPassword: await hashPassword(input.password),
  });

  res.status(201).json(AccountDTO.parse(account.toObject()));
});

export { loginRouter };
