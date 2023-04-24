import type { User } from "@prisma/client";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "~/services/db.server";

const userWithoutPassword = Prisma.validator<Prisma.UserArgs>()({
  select: { passwordHash: false }
});
export type UserWithoutPassword = Prisma.UserGetPayload<
  typeof userWithoutPassword
>;

export async function verifyLogin(email: User["email"], password: string) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email }
  });

  if (!userWithPassword) {
    return null;
  }

  const isValid = await bcrypt.compare(password, userWithPassword.passwordHash);

  if (!isValid) {
    return null;
  }

  const { passwordHash: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}
