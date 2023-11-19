-- CreateEnum
CREATE TYPE "source_type" AS ENUM ('form');

-- CreateEnum
CREATE TYPE "lead_score" AS ENUM ('badge_scan', 'conversation', 'meeting_requested');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" STRING NOT NULL,
    "first_name" STRING NOT NULL,
    "last_name" STRING NOT NULL,
    "full_name" STRING NOT NULL,
    "image_url" STRING,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" STRING NOT NULL,
    "slug" STRING NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "location" STRING NOT NULL,
    "twitter" STRING,
    "donation_amount" DECIMAL(65,30) NOT NULL DEFAULT 3.00,
    "donation_currency" STRING NOT NULL DEFAULT 'usd',
    "collect_leads" BOOL NOT NULL DEFAULT false,
    "legal_blurb" STRING,
    "response_template" STRING NOT NULL DEFAULT 'Thank you for helping us donate {{donationAmount}} to {{charity.name}} at {{event.name}}.',
    "tweet_template" STRING NOT NULL DEFAULT 'I just helped @CockroachDB donate {{donationAmount}} to {{charity}} at {{event}}.',
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "charities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" STRING NOT NULL,
    "slug" STRING NOT NULL,
    "description" STRING NOT NULL,
    "website" STRING,
    "twitter" STRING,
    "logo_svg" STRING,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "charities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "charities_events" (
    "event_id" UUID NOT NULL,
    "charity_id" UUID NOT NULL,
    "color" STRING NOT NULL,

    CONSTRAINT "charities_events_pkey" PRIMARY KEY ("event_id","charity_id")
);

-- CreateTable
CREATE TABLE "donations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_id" UUID NOT NULL,
    "charity_id" UUID NOT NULL,
    "source" "source_type" NOT NULL DEFAULT 'form',
    "source_meta" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "donations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "first_name" STRING NOT NULL,
    "last_name" STRING NOT NULL,
    "email" STRING NOT NULL,
    "company" STRING NOT NULL,
    "job_role" STRING NOT NULL,
    "score" "lead_score" NOT NULL DEFAULT 'badge_scan',
    "notes" STRING,
    "donation_id" UUID NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "i18n" (
    "namespace" STRING NOT NULL,
    "language" STRING NOT NULL,
    "key" STRING NOT NULL,
    "translation" STRING NOT NULL,

    CONSTRAINT "i18n_pkey" PRIMARY KEY ("key","language")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "events_slug_key" ON "events"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "leads_donation_id_key" ON "leads"("donation_id");

-- CreateIndex
CREATE INDEX "i18n_language_translation_idx" ON "i18n"("language", "translation");

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "charities" ADD CONSTRAINT "charities_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "charities_events" ADD CONSTRAINT "charities_events_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "charities_events" ADD CONSTRAINT "charities_events_charity_id_fkey" FOREIGN KEY ("charity_id") REFERENCES "charities"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_charity_id_fkey" FOREIGN KEY ("charity_id") REFERENCES "charities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_donation_id_fkey" FOREIGN KEY ("donation_id") REFERENCES "donations"("id") ON DELETE CASCADE ON UPDATE RESTRICT;
