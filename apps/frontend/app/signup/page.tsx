"use client";

import { useForm } from "react-hook-form";
import { signIn, signOut } from "auth";
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signup } from "@/actions/signup";
function page() {
  let schema = z.object({
    username: z.string().email(),
    password: z.string().min(5).max(25),
    name: z.string(),
    image: z.string(),
  });
  interface formData {
    name: string;
    username: string;
    password: string;
    image: string;
  }
  let {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<formData>({ resolver: zodResolver(schema) });
  async function signin(data: formData) {
    console.log({ data });
    let value = {
      email: data.username,
      password: data.password,
      image: data.image,
      name: data.name,
    };
    signup(value).then((user) => {
      console.log({ user });

    });
  }
  return (
    <div>
      <form onSubmit={handleSubmit(signin)}>
        <input
          type="name"
          placeholder="Enter your name"
          {...register("name", {
            required: true,
          })}
        />
        <p className="text-red-500 text-md">{errors.name?.message}</p>
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
        <input
          type="text"
          placeholder="Enter your image"
          {...register("image")}
        />
        <p className="text-red-500 text-md">{errors.image?.message}</p>

        <button type="submit">SignUp</button>
      </form>
      <button
        onClick={async () =>
          await signIn("github", { redirect: true, callbackUrl: "/" })
        }
      >
        Sign Up with github
      </button>
    </div>
  );
}

export default page;
