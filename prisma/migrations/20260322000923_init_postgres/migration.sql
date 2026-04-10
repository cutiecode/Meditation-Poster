-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorName" TEXT NOT NULL,
    "bookChapter" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT,
    "audioPath" TEXT,
    "photoPath" TEXT,
    "videoPath" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "posterPath" TEXT,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "familyName" TEXT,
    "backgroundPath" TEXT NOT NULL,
    "textColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "textPosition" TEXT NOT NULL DEFAULT 'bottom',
    "overlayOpacity" DOUBLE PRECISION NOT NULL DEFAULT 0.4,
    "fontFamily" TEXT NOT NULL DEFAULT 'Cormorant Garamond',
    "isActive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "activeTemplateId" TEXT,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);
