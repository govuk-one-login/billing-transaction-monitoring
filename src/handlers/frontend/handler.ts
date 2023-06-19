import serverlessExpress from "@vendia/serverless-express";
import { app } from "../../frontend/app";

export const handler = serverlessExpress({ app });
