import bcrypt from "bcrypt";
import { type Request } from "express";
import createError from "http-errors";
import jwt from "jsonwebtoken";
import passport from "passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Strategy as LocalStrategy } from "passport-local";
import { type IUser } from "../../user/user.dto";
import * as userService from "../../user/user.service";
const isValidPassword = async function (value: string, password: string) {
  const compare = await bcrypt.compare(value, password);
  return compare;
};

export const initPassport = (): void => {
  passport.use(
    new Strategy(
      {
        secretOrKey: process.env.JWT_ACCESS_SECRET as string,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      },
      async (token: { user: Request["user"] }, done) => {
        try {
          done(null, token.user);
        } catch (error) {
          done(error);
        }
      }
    )
  );

  // user login
  passport.use(
    "login",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const user = await userService.getUserByEmail(email, true);
          if (user == null) {
            done(createError(401, "Invalid email or password"), false);
            return;
          }

          if (!user.active) {
            done(createError(401, "User is inactive"), false);
            return;
          }

          const validate = await isValidPassword(password, user.password);
          if (!validate) {
            done(createError(401, "Invalid email or password"), false);
            return;
          }
          const { password: _p, ...result } = user;
          done(null, result, { message: "Logged in Successfully" });
        } catch (error: any) {
          done(createError(500, error.message));
        }
      }
    )
  );
};

export const createUserTokens = (user: Omit<IUser, "password">) => {
    const accessTokenSecret = process.env.JWT_ACCESS_SECRET ?? "";
    const refreshTokenSecret = process.env.JWT_REFRESH_SECRET ?? "";
  
    const payload = {
      _id: user._id,
      email: user.email,
      role: user.role,
    };
  
    const accessToken = jwt.sign(payload, accessTokenSecret, { expiresIn: "15m" });
    const refreshToken = jwt.sign(payload, refreshTokenSecret, { expiresIn: "7d" });
  
    return { accessToken, refreshToken };
  };
  
export const decodeToken = (token: string) => {
  const decode = jwt.decode(token);
  return decode as IUser;
};
