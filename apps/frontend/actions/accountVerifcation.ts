"use server";

import { db } from "@/lib/db";
import { getVerificationTokenbyToken } from "@/lib/getVerificatonToken";
import { getUserbyEmail } from "@/lib/user";

export const accountVerification = async (token: string) => {
  const existingToken = await getVerificationTokenbyToken(token);

  if (!existingToken) {
    return { error: "Token does not exist!" };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: "Token has expired!" };
  }

  const existingUser = await getUserbyEmail(existingToken.email);

  if (!existingUser) {
    return { error: "Email does not exist!" };
  }

  await db.user.update({
    where: { id: existingUser.id },
    data: { 
      emailVerified: new Date(),
      email: existingToken.email,
    }
  });

  await db.verificationToken.delete({
    where: { id: existingToken.id }
  });

  return { success: "Email verified!" };
};