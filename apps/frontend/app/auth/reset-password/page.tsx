"use client";

import { useForm } from "react-hook-form";
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams } from "next/navigation";
import { reset } from "@/actions/reset";
import { newPassword } from "@/actions/new-password";

function page() {
  const searchparams = useSearchParams();
  const urlError =
    searchparams.get("error") === "OAuthAccountNotLinked"
      ? "E-mail already in use with different provider!"
      : "";
      const token = searchparams.get("token");
      console.log({token});
  let schema = z.object({
    password: z.string().email(),
  });
  interface formData {
    password: string;
  }
  let {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<formData>({ resolver: zodResolver(schema) });
  const onSubmit = (data: formData) => {
    console.log(data);
    newPassword(data, token);
  };
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          type="password"
          placeholder="Enter new password"
          {...register("password", {
            required: true,
          })}
        />
        <p className="text-red-500 text-md">{errors.password?.message}</p>
        <button type="submit">SignIn</button>
      </form>
    </div>
  );
}

export default page;
