import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { Resend } from "resend";
import { getVerificationTokenbyEmail } from "./getVerificatonToken";
import { db } from "./db";
import { getPasswordResetTokenByEmail } from "./data/getPasswordResetToken";
import { getTwoFactorTokenByEmail } from "./data/getTwoFactorToken";

const resend = new Resend(process.env.RESEND_API_KEY);

export const generateTwoFactorToken = async (email: string) => {
  const token = crypto.randomInt(100_000, 1_000_000).toString();
  const expires = new Date(new Date().getTime() + 5 * 60 * 1000);

  const existingToken = await getTwoFactorTokenByEmail(email);

  if (existingToken) {
    await db.twoFactorToken.delete({
      where: {
        id: existingToken.id,
      },
    });
  }

  const twoFactorToken = await db.twoFactorToken.create({
    data: {
      email,
      token,
      expires,
    },
  });
  // await resend.emails.send({
  //   from: "onboarding@resend.dev",
  //   to: process.env.personalEmail as string,
  //   subject: "2FA Code",
  //   html: `<p>Your 2FA code: ${token} for email ${email}</p>`,
  // });

  return twoFactorToken;
};

export const generateVerificationToken = async (email: string) => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000);
  let existingToken = await getVerificationTokenbyEmail(email);
  if (existingToken) {
    await db.verificationToken.delete({
      where: { id: existingToken.id },
    });
  }
  const verificationToken = await db.verificationToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  let confirmationLink = `http://localhost:3000/auth/account-verification?token=${token}`;
  resend.emails.send({
    from: "onboarding@resend.dev",
    to: process.env.personalEmail as string,
    subject: "PD: Verify your Account",
    html: `<p>Congrats on creating your <strong>Account on ProgrammerDost</strong>!</p><br><br> <strong>Here is your verification link:</strong><br><h3>${confirmationLink}</h3>for email: ${email}`,
  });
  return verificationToken;
};
export const generatePasswordResetToken = async (email: string) => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000);

  const existingToken = await getPasswordResetTokenByEmail(email);

  if (existingToken) {
    await db.resetPasswordToken.delete({
      where: { id: existingToken.id },
    });
  }

  const passwordResetToken = await db.resetPasswordToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  const resetLink = `http://localhost:3000/auth/reset-password?token=${token}`;

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: process.env.personalEmail as string,
    subject: "Reset your password",
    html: `<p>Click <a href="${resetLink}">here</a> to reset password.</p><br>for email: ${email}`,
  });

  return passwordResetToken;
};
