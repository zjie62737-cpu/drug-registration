-- AlterTable
ALTER TABLE "ApplicationStage" ADD COLUMN "clockRestartedAt" DATETIME;
ALTER TABLE "ApplicationStage" ADD COLUMN "clockStoppedAt" DATETIME;
ALTER TABLE "ApplicationStage" ADD COLUMN "reviewTrack" TEXT;
ALTER TABLE "ApplicationStage" ADD COLUMN "trackStatus" TEXT;

-- CreateTable
CREATE TABLE "DeficiencyLetter" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "applicationId" INTEGER NOT NULL,
    "stageId" INTEGER NOT NULL,
    "round" INTEGER NOT NULL,
    "track" TEXT,
    "issueDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" DATETIME NOT NULL,
    "responseDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'issued',
    "questions" TEXT NOT NULL,
    "internalNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DeficiencyLetter_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DeficiencyLetter_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "ApplicationStage" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DMFReference" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "applicationId" INTEGER NOT NULL,
    "dmfType" TEXT NOT NULL,
    "dmfNumber" TEXT NOT NULL,
    "dmfHolder" TEXT NOT NULL,
    "authorizationLetter" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DMFReference_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PostApprovalChange" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "applicationId" INTEGER NOT NULL,
    "changeType" TEXT NOT NULL,
    "changeCategory" TEXT NOT NULL,
    "changeDescription" TEXT NOT NULL,
    "submissionDate" DATETIME,
    "approvalDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PostApprovalChange_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "entityType" TEXT NOT NULL,
    "entityId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "changes" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Labeling" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "applicationId" INTEGER NOT NULL,
    "labelType" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'zh-CN',
    "version" INTEGER NOT NULL DEFAULT 1,
    "content" TEXT NOT NULL,
    "negotiationStatus" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Labeling_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Application" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "applicationNo" TEXT,
    "regulatorySystemId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "applicationCategory" TEXT,
    "registrationClass" TEXT,
    "drugName" TEXT NOT NULL,
    "drugType" TEXT NOT NULL,
    "genericName" TEXT,
    "tradeName" TEXT,
    "dosageForm" TEXT,
    "specification" TEXT,
    "indication" TEXT,
    "usageDosage" TEXT,
    "atcCode" TEXT,
    "applicantId" INTEGER NOT NULL,
    "manufacturer" TEXT,
    "isOverseas" BOOLEAN NOT NULL DEFAULT false,
    "productionSite" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "priorityReview" BOOLEAN NOT NULL DEFAULT false,
    "breakthroughTherapy" BOOLEAN NOT NULL DEFAULT false,
    "orphanDrug" BOOLEAN NOT NULL DEFAULT false,
    "emergencyUse" BOOLEAN NOT NULL DEFAULT false,
    "isSmallEnterprise" BOOLEAN NOT NULL DEFAULT false,
    "feePayer" TEXT,
    "submittedAt" DATETIME,
    "approvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Application_regulatorySystemId_fkey" FOREIGN KEY ("regulatorySystemId") REFERENCES "RegulatorySystem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Application_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Application" ("applicantId", "applicationCategory", "applicationNo", "approvedAt", "atcCode", "breakthroughTherapy", "createdAt", "dosageForm", "drugName", "drugType", "emergencyUse", "feePayer", "genericName", "id", "indication", "isOverseas", "isSmallEnterprise", "manufacturer", "orphanDrug", "priorityReview", "productionSite", "registrationClass", "regulatorySystemId", "specification", "status", "submittedAt", "tradeName", "type", "updatedAt", "usageDosage") SELECT "applicantId", "applicationCategory", "applicationNo", "approvedAt", "atcCode", "breakthroughTherapy", "createdAt", "dosageForm", "drugName", "drugType", "emergencyUse", "feePayer", "genericName", "id", "indication", "isOverseas", "isSmallEnterprise", "manufacturer", "orphanDrug", "priorityReview", "productionSite", "registrationClass", "regulatorySystemId", "specification", "status", "submittedAt", "tradeName", "type", "updatedAt", "usageDosage" FROM "Application";
DROP TABLE "Application";
ALTER TABLE "new_Application" RENAME TO "Application";
CREATE UNIQUE INDEX "Application_applicationNo_key" ON "Application"("applicationNo");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
