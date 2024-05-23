"use client";
import { accountVerification } from "@/actions/accountVerifcation";
import { useSearchParams } from "next/navigation";
import React, { useCallback, useEffect } from "react";

function page() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const onSubmit = useCallback(() => {
    if (!token) return;
    accountVerification(token as string);
    console.log({ token });
  }, [token]);
  useEffect(() => {
    onSubmit();
  }, [onSubmit]);
  return <div>page</div>;
}

export default page;
