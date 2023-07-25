import { app } from "./app";
import { initApp } from "./init-app";
import { middleware } from "./middleware";

const PORT = process.env.PORT ?? 3000;

initApp(app, middleware);
app.listen(PORT, () => console.log(`Server listening to port ${PORT}`));
