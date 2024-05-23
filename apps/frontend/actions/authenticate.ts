"use server";
import { signIn, signOut } from "@/auth";
import { getTwoFactorTokenByEmail } from "@/lib/data/getTwoFactorToken";
import { getTwoFactorConfirmationByUserId } from "@/lib/data/two-fa-confirmation";
import { db } from "@/lib/db";
import {
  generateTwoFactorToken,
  generateVerificationToken,
} from "@/lib/generateTokens";
import { getUserbyEmail } from "@/lib/user";
// import { signIn,signOut } from "next-auth/react";
import { AuthError } from "next-auth";
import { z } from "zod";
export const logout = async () => {
  await signOut();
};
let LoginSchema = z.object({
  username: z.string().email(),
  password: z.string().min(5).max(25),
  code: z.optional(z.string()),
});
export async function login(
  data: z.infer<typeof LoginSchema>,
  callbackUrl?: string | null
) {
  // console.log("got called", callbackUrl, data);
  const existingUser = await getUserbyEmail(data.username);
  if (!existingUser || !existingUser.password) {
    return { Error: "User not found" };
  }
  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(
      existingUser.email as string
    );
    console.log({ verificationToken }, "mail sent");
    return { success: "Verification Email Sent" };
  }

  // 2fa
  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    if (data?.code) {
      const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);
      console.log({ twoFactorToken }, "reached here:", 2);
      if (!twoFactorToken) {
        return { error: "Invalid code!" };
      }

      if (twoFactorToken.token !== data?.code) {
        return { error: "Invalid code!" };
      }

      const hasExpired = new Date(twoFactorToken.expires) < new Date();

      if (hasExpired) {
        return { error: "Code expired!" };
      }
      await db.twoFactorToken.delete({
        where: { id: twoFactorToken.id },
      });
      const existingConfirmation = await getTwoFactorConfirmationByUserId(
        existingUser.id
      );
      if (existingConfirmation) {
        await db.twoFactorConfirmation.delete({
          where: { id: existingConfirmation.id },
        });
      }
      let confirmCreated = await db.twoFactorConfirmation.create({
        data: {
          userId: existingUser.id,
        },
      });
      console.log({ confirmCreated });
    } else {
      console.log("reached elsewhere");
      const twoFactorToken = await generateTwoFactorToken(
        existingUser.email as string
      );
      console.log({ twoFactorToken });
      return { twoFactor: true };
    }
  }
  try {
    await signIn("credentials", {
      username: data.username,
      password: data.password,
      redirect: true,
      redirectTo: callbackUrl || "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" };
        default:
          return { error: "Something went wrong!" };
      }
    }

    throw error;
  }
}

export const githubLogin = async (callbackUrl: string) => {
  await signIn("github", { redirect: true, redirectTo: callbackUrl || "/" });
};
