-- CreateTable
CREATE TABLE "Record" (
    "id" SERIAL NOT NULL,
    "messageId" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "trackName" TEXT NOT NULL,

    CONSTRAINT "Record_pkey" PRIMARY KEY ("id")
);
