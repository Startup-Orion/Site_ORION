import { app } from "./app.js";
import { env } from "./shared/config/env.js";

app.listen(env.PORT, () => {
  console.log(`API rodando em http://localhost:${env.PORT}`);
});
