"use client";

import { useForm } from "react-hook-form";
// import { signIn, signOut } from "@/auth";
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { githubLogin, login, logout } from "@/actions/authenticate";
import { useSearchParams } from "next/navigation";

function page() {
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const searchparams = useSearchParams();
  const urlError =
    searchparams.get("error") === "OAuthAccountNotLinked"
      ? "E-mail already in use with different provider!"
      : "";
  console.log({ urlError });
  let callbackUrl: string;
  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams) {
      let completeUrl = urlParams.get("callbackUrl") as string;
      if (completeUrl) {
        let url = completeUrl.split("http://localhost:3000");
        callbackUrl = url[1];
        console.log(callbackUrl);
      }
    }
  }
  let schema = z.object({
    username: z.string().email(),
    password: z.string().min(5).max(25),
    code: z.optional(z.string())
  });
  interface formData {
    username: string;
    password: string;
    code:string;
  }
  let {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<formData>({ resolver: zodResolver(schema) });
  async function signin(data:formData) {
    // await signIn("Credentials", {
    //   username: "finally@gmail.com",
    //   password: "finally@gmail.com",
    //   redirect: true,
    //   redirectTo: callbackUrl || ".",
    // });
    login(data, callbackUrl).then((data) => {
      if (data?.twoFactor) {
        setShowTwoFactor(true);
      }
    });
  }
  let data = {
    username: "finally@gmail.com",
    password: "finl@gmail.com",
  };
  return (
    <div>
      <form onSubmit={handleSubmit(signin)}>
      {showTwoFactor && ( 
         <>
        <input
          type="code"
          placeholder="2Fa Code: sent to your mail"
          {...register("code", {
            required: true,
          })}
        />
        <p className="text-red-500 text-md">{errors.username?.message}</p>
        </>
)}
      {!showTwoFactor && (
        <>
        <input
          type="email"
          placeholder="enter your email address"
          {...register("username", {
            required: true,
            validate: {
              matchPattern: (value) =>
                /[A-Za-z0-9]/.test(value) || "Invalid email",
            },
          })}
        />
        <p className="text-red-500 text-md">{errors.username?.message}</p>

        <input
          type="password"
          placeholder="Enter your password"
          {...register("password")}
        />
        <p className="text-red-500 text-md">{errors.password?.message}</p>
        </>
      )}
        <button type="submit">  {showTwoFactor ? "Confirm" : "Login"}lol</button>
      </form>
      <button onClick={() => logout()}>Sign Out</button>
      <button onClick={() => githubLogin(callbackUrl)}>
        Sign In with github
      </button>
      <button onClick={() => login(data, callbackUrl)}>
       Direct Sign in with cred
      </button>
      <form></form>
    </div>
  );
}

export default page;
