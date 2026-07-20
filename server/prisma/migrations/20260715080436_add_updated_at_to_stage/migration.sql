/*
  Warnings:

  - Added the required column `updatedAt` to the `ApplicationStage` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ApplicationStage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "applicationId" INTEGER NOT NULL,
    "stageName" TEXT NOT NULL,
    "stageOrder" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "assignedReviewerId" INTEGER,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "deadline" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ApplicationStage_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ApplicationStage_assignedReviewerId_fkey" FOREIGN KEY ("assignedReviewerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ApplicationStage" ("applicationId", "assignedReviewerId", "completedAt", "createdAt", "deadline", "id", "notes", "stageName", "stageOrder", "startedAt", "status") SELECT "applicationId", "assignedReviewerId", "completedAt", "createdAt", "deadline", "id", "notes", "stageName", "stageOrder", "startedAt", "status" FROM "ApplicationStage";
DROP TABLE "ApplicationStage";
ALTER TABLE "new_ApplicationStage" RENAME TO "ApplicationStage";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
