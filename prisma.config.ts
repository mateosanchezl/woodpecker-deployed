import 'dotenv/config'; // <--- Add this line at the top
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
  // Optional: Add migration configuration if needed
  // migrations: {
  //   path: 'prisma/migrations',
  // },
});