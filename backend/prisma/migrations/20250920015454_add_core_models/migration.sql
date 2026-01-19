/*
  Warnings:

  - You are about to drop the column `createdBy` on the `Pod` table. All the data in the column will be lost.
  - You are about to drop the column `joinedAt` on the `PodMember` table. All the data in the column will be lost.
  - You are about to drop the `ProjectPlan` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,podId]` on the table `PodMember` will be added. If there are existing duplicate values, this will fail.
  - Made the column `role` on table `PodMember` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."ProjectPlan" DROP CONSTRAINT "ProjectPlan_podId_fkey";

-- AlterTable
ALTER TABLE "public"."Pod" DROP COLUMN "createdBy";

-- AlterTable
ALTER TABLE "public"."PodMember" DROP COLUMN "joinedAt",
ALTER COLUMN "role" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "password" TEXT NOT NULL,
ALTER COLUMN "name" SET NOT NULL;

-- DropTable
DROP TABLE "public"."ProjectPlan";

-- CreateTable
CREATE TABLE "public"."Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "podId" TEXT NOT NULL,
    "assignedTo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Reward" (
    "id" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "reason" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reward_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PodMember_userId_podId_key" ON "public"."PodMember"("userId", "podId");

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_podId_fkey" FOREIGN KEY ("podId") REFERENCES "public"."Pod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reward" ADD CONSTRAINT "Reward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
