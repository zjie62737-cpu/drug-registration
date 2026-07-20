-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Application" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "applicationNo" TEXT,
    "type" TEXT NOT NULL,
    "drugName" TEXT NOT NULL,
    "drugType" TEXT NOT NULL,
    "specification" TEXT,
    "applicantId" INTEGER NOT NULL,
    "manufacturer" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Application_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Application" ("applicantId", "applicationNo", "createdAt", "drugName", "drugType", "id", "manufacturer", "specification", "status", "type", "updatedAt") SELECT "applicantId", "applicationNo", "createdAt", "drugName", "drugType", "id", "manufacturer", "specification", "status", "type", "updatedAt" FROM "Application";
DROP TABLE "Application";
ALTER TABLE "new_Application" RENAME TO "Application";
CREATE UNIQUE INDEX "Application_applicationNo_key" ON "Application"("applicationNo");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
