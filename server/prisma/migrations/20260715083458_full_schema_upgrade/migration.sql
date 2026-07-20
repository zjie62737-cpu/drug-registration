-- CreateTable
CREATE TABLE "RegulatorySystem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "EnterpriseInfo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "applicationId" INTEGER NOT NULL,
    "businessLicense" TEXT,
    "productionLicense" TEXT,
    "gmpCertificate" TEXT,
    "legalRepresentative" TEXT,
    "contactPerson" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "contactFax" TEXT,
    "contactMobile" TEXT,
    "productionAddress" TEXT,
    "mailingAddress" TEXT,
    "productionPostal" TEXT,
    "mailingPostal" TEXT,
    "qualityDirector" TEXT,
    "legalRepPosition" TEXT,
    "contactPosition" TEXT,
    "qualityDirPosition" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EnterpriseInfo_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CROInfo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "applicationId" INTEGER NOT NULL,
    "orgName" TEXT NOT NULL,
    "responsiblePerson" TEXT NOT NULL,
    "contactInfo" TEXT,
    "studyPhase" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CROInfo_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PatentDeclaration" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "applicationId" INTEGER NOT NULL,
    "patentNo" TEXT NOT NULL,
    "patentOwner" TEXT NOT NULL,
    "grantDate" DATETIME,
    "hasForeignPatent" BOOLEAN NOT NULL DEFAULT false,
    "nonInfringement" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PatentDeclaration_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CTDModule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "applicationId" INTEGER NOT NULL,
    "moduleNumber" TEXT NOT NULL,
    "moduleName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CTDModule_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CTDSubModule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ctdModuleId" INTEGER NOT NULL,
    "subNumber" TEXT NOT NULL,
    "subName" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CTDSubModule_ctdModuleId_fkey" FOREIGN KEY ("ctdModuleId") REFERENCES "CTDModule" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FDARegistration" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FDARegistration_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EMARegistration" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "applicationId" INTEGER NOT NULL,
    "procedureType" TEXT NOT NULL,
    "rmsCountry" TEXT,
    "cmsCountries" TEXT,
    "orphanDesignation" BOOLEAN NOT NULL DEFAULT false,
    "paediatricPlan" BOOLEAN NOT NULL DEFAULT false,
    "saProcedure" BOOLEAN NOT NULL DEFAULT false,
    "saNumber" TEXT,
    "maaNumber" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EMARegistration_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Application" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "applicationNo" TEXT,
    "regulatorySystemId" INTEGER NOT NULL DEFAULT 1,
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
INSERT INTO "new_Application" ("applicantId", "applicationNo", "createdAt", "drugName", "drugType", "id", "manufacturer", "specification", "status", "type", "updatedAt") SELECT "applicantId", "applicationNo", "createdAt", "drugName", "drugType", "id", "manufacturer", "specification", "status", "type", "updatedAt" FROM "Application";
DROP TABLE "Application";
ALTER TABLE "new_Application" RENAME TO "Application";
CREATE UNIQUE INDEX "Application_applicationNo_key" ON "Application"("applicationNo");
CREATE TABLE "new_Document" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "applicationId" INTEGER NOT NULL,
    "ctdSubModuleId" INTEGER,
    "documentType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 1,
    "docStatus" TEXT NOT NULL DEFAULT 'submitted',
    "uploadedById" INTEGER NOT NULL,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Document_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Document_ctdSubModuleId_fkey" FOREIGN KEY ("ctdSubModuleId") REFERENCES "CTDSubModule" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Document_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Document" ("applicationId", "documentType", "fileName", "filePath", "id", "uploadedAt", "uploadedById") SELECT "applicationId", "documentType", "fileName", "filePath", "id", "uploadedAt", "uploadedById" FROM "Document";
DROP TABLE "Document";
ALTER TABLE "new_Document" RENAME TO "Document";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "RegulatorySystem_code_key" ON "RegulatorySystem"("code");

-- CreateIndex
CREATE UNIQUE INDEX "EnterpriseInfo_applicationId_key" ON "EnterpriseInfo"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "FDARegistration_applicationId_key" ON "FDARegistration"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "EMARegistration_applicationId_key" ON "EMARegistration"("applicationId");
