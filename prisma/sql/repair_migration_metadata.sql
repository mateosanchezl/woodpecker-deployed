CREATE TABLE IF NOT EXISTS "_prisma_migrations_backup_20260213"
AS TABLE "_prisma_migrations" WITH NO DATA;

TRUNCATE TABLE "_prisma_migrations_backup_20260213";
INSERT INTO "_prisma_migrations_backup_20260213" SELECT * FROM "_prisma_migrations";

TRUNCATE TABLE "_prisma_migrations";
