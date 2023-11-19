import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const english = [
  {
    key: "donate-instructions",
    language: "en",
    namespace: "common",
    translation:
      "Complete the form and we'll donate {{amount}} to your selected charity."
  },
  {
    key: "email",
    language: "en",
    namespace: "common",
    translation: "Company Email"
  },
  {
    key: "family-name",
    language: "en",
    namespace: "common",
    translation: "Last Name"
  },
  {
    key: "given-name",
    language: "en",
    namespace: "common",
    translation: "First Name"
  },
  {
    key: "organization",
    language: "en",
    namespace: "common",
    translation: "Company"
  },
  {
    key: "organization-title",
    language: "en",
    namespace: "common",
    translation: "Job Title"
  },
  {
    key: "select-charity",
    language: "en",
    namespace: "common",
    translation: "Select a Charity"
  },
  {
    key: "share-to-twitter",
    language: "en",
    namespace: "common",
    translation: "Share to Twitter"
  },
  { key: "submit", language: "en", namespace: "common", translation: "Submit" }
];

const japanese = [
  {
    key: "donate-instructions",
    language: "ja",
    namespace: "common",
    translation:
      "フォームに記入していただければ、選択した慈善団体に {{amount}} を寄付いたします。"
  },
  {
    key: "email",
    language: "ja",
    namespace: "common",
    translation: "会社のメールアドレス"
  },
  {
    key: "family-name",
    language: "ja",
    namespace: "common",
    translation: "苗字"
  },
  {
    key: "given-name",
    language: "ja",
    namespace: "common",
    translation: "下の名前"
  },
  {
    key: "organization",
    language: "ja",
    namespace: "common",
    translation: "会社"
  },
  {
    key: "organization-title",
    language: "ja",
    namespace: "common",
    translation: "役職名"
  },
  {
    key: "select-charity",
    language: "ja",
    namespace: "common",
    translation: "慈善団体を選ぶ"
  },
  {
    key: "share-to-twitter",
    language: "ja",
    namespace: "common",
    translation: "Twitterでシェア"
  },
  {
    key: "submit",
    language: "ja",
    namespace: "common",
    translation: "差し出す"
  }
];

async function seed() {
  await prisma.i18n.createMany({
    data: [...english, ...japanese]
  });
}

seed();
