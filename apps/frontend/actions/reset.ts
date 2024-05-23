"use server";

import * as z from "zod";
import { getUserbyEmail } from "@/lib/user";
import { generatePasswordResetToken } from "@/lib/generateTokens";

// export const ResetSchema = z.object({
//     email: z.string().email({
//       message: "Email is required",
//     }),
//   });
export const reset = async (email:string) => {
//   const validatedFields = ResetSchema.safeParse(values);

//   if (!validatedFields.success) {
//     return { error: "Invalid emaiL!" };
//   }

//   const { email } = validatedFields.data;

  const existingUser = await getUserbyEmail(email);

  if (!existingUser) {
    return { error: "Email not found!" };
  }

  const passwordResetToken = await generatePasswordResetToken(email);
  console.log({passwordResetToken}, "Password reset breached");

  return { success: "Reset email sent!" };
}