import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import type { PassportStatic } from "passport";
import type { IUserService } from "../../services/user";

function configurePassport(
  passport: PassportStatic,
  userService: IUserService,
) {
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromExtractors([
      (req) => req?.cookies?.token || null,
    ]),
    secretOrKey: "your_jwt_secret",
  };

  passport.use(
    new JwtStrategy(jwtOptions, async (payload, done) => {
      try {
        const existingUser = await userService.checkUserByEmail(payload.email);

        if (existingUser) return done(null, { email: payload.email });

        return done(null, false);
      } catch (err) {
        return done(err, false);
      }
    }),
  );
}

export default configurePassport;
