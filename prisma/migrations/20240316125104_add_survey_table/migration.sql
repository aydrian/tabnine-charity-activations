-- AlterTable
ALTER TABLE "events" ALTER COLUMN "tweet_template" SET DEFAULT 'I just helped @Tabnine donate {{donationAmount}} to {{charity}} at {{event}}.';

-- CreateTable
CREATE TABLE "surveys" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" STRING NOT NULL,
    "using_ai" STRING NOT NULL,
    "company_adoption" STRING NOT NULL,
    "sdic_use_ai" STRING NOT NULL,
    "statement_agree" STRING NOT NULL,
    "tool_eval" STRING NOT NULL,
    "donation_id" UUID NOT NULL,

    CONSTRAINT "surveys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "surveys_donation_id_key" ON "surveys"("donation_id");

-- AddForeignKey
ALTER TABLE "surveys" ADD CONSTRAINT "surveys_donation_id_fkey" FOREIGN KEY ("donation_id") REFERENCES "donations"("id") ON DELETE CASCADE ON UPDATE RESTRICT;
