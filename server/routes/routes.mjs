import { accountDeletionController } from "../controllers/user/account.deletion.controller.mjs";
import { csrfController } from "../controllers/auth/csrf.controller.mjs";
import express from "express";
import { jwtAuthMiddleware } from "../middlewares/jwt.auth.middleware.mjs";
import { logoutController } from "../controllers/user/logout.controller.mjs";
import { parameterMiddleware } from "../middlewares/parameter.middleware.mjs";
import { profileController } from "../controllers/user/profile.controller.mjs";
import { profileUpdateController } from "../controllers/user/profile.update.controller.mjs";
import { signInController } from "../controllers/auth/signin.controller.mjs";
import { signUpController } from "../controllers/auth/signup.controller.mjs";

export const routes = express.Router();

routes.post("/auth/sign-up", signUpController);
routes.post("/auth/sign-in", signInController);

routes.post(
  "/:userName/logout",
  jwtAuthMiddleware,
  parameterMiddleware,
  logoutController
);

routes.put(
  "/:userName/profile-update",
  jwtAuthMiddleware,
  parameterMiddleware,
  profileUpdateController
);

routes.delete(
  "/:userName/account-deletion",
  jwtAuthMiddleware,
  parameterMiddleware,
  accountDeletionController
);

routes.get("/auth/csrf-token", csrfController);

routes.get(
  "/:userName/profile",
  jwtAuthMiddleware,
  parameterMiddleware,
  profileController
);
