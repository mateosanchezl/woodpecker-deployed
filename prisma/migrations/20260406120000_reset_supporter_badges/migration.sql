UPDATE "User"
SET "supporterBadgeGrantedAt" = NULL
WHERE "supporterBadgeGrantedAt" IS NOT NULL;
