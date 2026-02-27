import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from '@prisma/client';
import { incrementPrismaOperationCount } from '@/lib/metrics/request-metrics';

const connectionString = process.env.DATABASE_URL!;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

function createPrismaClient() {
  return new PrismaClient({ adapter }).$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          incrementPrismaOperationCount();
          return query(args);
        },
      },
      async $allOperations({ args, query }) {
        incrementPrismaOperationCount();
        return query(args);
      },
    },
  });
}

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;
const globalForPrisma = global as unknown as { prisma?: ExtendedPrismaClient };

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
