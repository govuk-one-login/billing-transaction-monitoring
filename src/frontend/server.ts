import { getFromEnv } from "../shared/utils";
import { app } from "./app";
import { initApp } from "./init-app";
import { middleware } from "./middleware";

const PORT = getFromEnv("PORT") ?? 3000;

initApp(app, middleware);
app.listen(PORT, () => console.log(`Server listening to port ${PORT}`));
