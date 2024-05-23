import { db } from "./db";

export const getUserbyEmail = async(email: string) => {
  try {
    const existingUser =await db.user.findUnique({ where: { email } });
    // if (!existingUser) return "User does not exist!";
    return existingUser;
  } catch (err) {
    console.error(err, "loc: lib/user");
    return null
  }
  //   console.log({ existingUser });
};
