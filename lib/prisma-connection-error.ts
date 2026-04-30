import { Prisma } from '@prisma/client';

const CONNECTION_HINT =
  'Could not connect to Postgres (Neon). Wake or resume the project in the Neon dashboard, confirm DATABASE_URL in .env matches the current connection string (sslmode=require), check VPN/firewall for port 5432, then restart next dev.';

/**
 * Maps Prisma connection / pool errors to a short admin-facing message.
 */
export function formatPrismaConnectionError(err: unknown): string {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P1001') {
    return CONNECTION_HINT;
  }
  if (err instanceof Prisma.PrismaClientInitializationError) {
    const msg = err.message;
    if (/Can't reach database|P1001|ECONNREFUSED|ETIMEDOUT|timeout/i.test(msg)) {
      return CONNECTION_HINT;
    }
    return msg.length > 280 ? `${msg.slice(0, 280)}…` : msg;
  }
  if (err instanceof Error) {
    if (/Can't reach database|P1001|ECONNREFUSED|ETIMEDOUT|Can't reach database server/i.test(err.message)) {
      return CONNECTION_HINT;
    }
    return err.message;
  }
  return CONNECTION_HINT;
}
