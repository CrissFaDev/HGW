import 'dotenv/config';

import app from './app';
import { ensureDefaultAdmin } from './services/admin-user.service';

const port = Number(process.env.PORT || 3000);

async function main(): Promise<void> {
  await ensureDefaultAdmin();

  app.listen(port, () => {
    console.log(`API running on http://localhost:${port}`);
  });
}

main().catch((error) => {
  console.error('API startup failed', error);
  process.exit(1);
});
