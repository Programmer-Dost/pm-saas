"use server"
import { generateVerificationToken } from "@/lib/generateTokens";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
export async function signup(value:{email:string,password:string, name:string, image:string}){
    try {
        const prisma = new PrismaClient().$extends(withAccelerate());
        console.log(value, "from server")
            let newUser = await prisma.user.create({
              data: {
                name: value.name,
                email: value.email,
                password: value.password,
                image: value.image
              },
              select: {
                name: true,
                email: true,
                image: true
              },
            });
            const verificationToken = await generateVerificationToken(value.email as string);
            console.log({verificationToken}, "mail sent");
            return newUser;
          } catch (err) {
            console.log(err);
          }
        }
    
