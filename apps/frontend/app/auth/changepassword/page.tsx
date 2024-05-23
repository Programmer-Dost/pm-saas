"use client";

import { useForm } from "react-hook-form";
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams } from "next/navigation";
import { reset } from "@/actions/reset";

function page() {
  const searchparams = useSearchParams();
  const urlError =
    searchparams.get("error") === "OAuthAccountNotLinked"
      ? "E-mail already in use with different provider!"
      : ""; 
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
  });
  interface formData {
    username: string;
  }
  let {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<formData>({ resolver: zodResolver(schema) });
  const onSubmit = (data:formData) => {
console.log(data);
let email = data.username;
reset(email as string);
  }
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
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
        <button type="submit">SignIn</button>
      </form>
    </div>
  );
}

export default page;
