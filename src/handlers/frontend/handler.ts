import serverlessExpress from "@vendia/serverless-express";
import { app } from "../../frontend/app";
import "../../frontend/assets/styles/app.scss";

export const handler = serverlessExpress({ app });
