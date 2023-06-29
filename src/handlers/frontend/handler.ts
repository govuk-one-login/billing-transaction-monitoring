import serverlessExpress from "@vendia/serverless-express";
import { app } from "../../frontend/app";
import { initApp } from "../../frontend/init-app";

initApp(app);

export const handler = serverlessExpress({ app });
