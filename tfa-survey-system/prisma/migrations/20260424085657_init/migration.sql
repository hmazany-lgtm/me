-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "block" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "textEn" TEXT NOT NULL,
    "textAr" TEXT NOT NULL,
    "hintEn" TEXT,
    "hintAr" TEXT,
    "whyItMatters" TEXT NOT NULL DEFAULT '',
    "visibleToRoles" TEXT NOT NULL,
    "visibleToSectors" TEXT NOT NULL,
    "hiddenFromRoles" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "publishedAt" DATETIME,
    "lastEditedBy" TEXT,
    "scaleMin" INTEGER,
    "scaleMax" INTEGER,
    "scaleMinLabelEn" TEXT,
    "scaleMaxLabelEn" TEXT,
    "scaleMinLabelAr" TEXT,
    "scaleMaxLabelAr" TEXT,
    "minValue" INTEGER,
    "maxValue" INTEGER
);

-- CreateTable
CREATE TABLE "QuestionOption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "labelEn" TEXT NOT NULL,
    "labelAr" TEXT NOT NULL,
    "isOther" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "QuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LogicRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionId" TEXT NOT NULL,
    "conditionLogic" TEXT NOT NULL DEFAULT 'AND',
    "action" TEXT NOT NULL,
    "targetQuestionId" TEXT,
    CONSTRAINT "LogicRule_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LogicCondition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ruleId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "questionId" TEXT,
    "operator" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "LogicCondition_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "LogicRule" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SurveyResponse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "respondentRole" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "companySize" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL,
    "completedAt" DATETIME,
    "confidenceScore" REAL,
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "language" TEXT NOT NULL DEFAULT 'en',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ResponseAnswer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "responseId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "questionVersion" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    "answeredAt" DATETIME NOT NULL,
    CONSTRAINT "ResponseAnswer_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "SurveyResponse" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'viewer',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");
