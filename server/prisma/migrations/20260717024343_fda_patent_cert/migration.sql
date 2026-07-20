-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FDARegistration" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "applicationId" INTEGER NOT NULL,
    "dunsNumber" TEXT,
    "feiNumber" TEXT,
    "esgAccount" TEXT,
    "usAgentName" TEXT,
    "usAgentContact" TEXT,
    "usAgentEmail" TEXT,
    "ndcNumber" TEXT,
    "preAssignedBla" TEXT,
    "proprietaryName" TEXT,
    "applicationForm" TEXT,
    "patentCertPara" TEXT,
    "patentCertNumber" TEXT,
    "patentCertExpiry" DATETIME,
    "patentCertNotice" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FDARegistration_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_FDARegistration" ("applicationForm", "applicationId", "createdAt", "dunsNumber", "esgAccount", "feiNumber", "id", "ndcNumber", "preAssignedBla", "proprietaryName", "usAgentContact", "usAgentEmail", "usAgentName") SELECT "applicationForm", "applicationId", "createdAt", "dunsNumber", "esgAccount", "feiNumber", "id", "ndcNumber", "preAssignedBla", "proprietaryName", "usAgentContact", "usAgentEmail", "usAgentName" FROM "FDARegistration";
DROP TABLE "FDARegistration";
ALTER TABLE "new_FDARegistration" RENAME TO "FDARegistration";
CREATE UNIQUE INDEX "FDARegistration_applicationId_key" ON "FDARegistration"("applicationId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
