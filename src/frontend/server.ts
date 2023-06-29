import { app } from "./app";
import { initApp } from "./init-app";

const PORT = process.env.PORT ?? 3000;

initApp(app);
app.listen(PORT, () => console.log(`Server listening to port ${PORT}`));
