"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { PlaidLinkOnSuccess, usePlaidLink } from "react-plaid-link";

import { createLinkToken, exchangePublicToken } from "@/lib/actions/user.actions";
import Image from "next/image";
import { Button } from "./ui/button";

function PlaidLink({ user, variant }: PlaidLinkProps) {
  const router = useRouter();
  const [token, setToken] = useState("");

  useEffect(() => {
    const getLinkToken = async () => {
      const data = await createLinkToken(user);
      setToken(data?.linkToken);
    };
    getLinkToken();
  }, [user]);

  const onSuccess = useCallback<PlaidLinkOnSuccess>(
    async (public_token: string) => {
      await exchangePublicToken({ publicToken: public_token, user });
      router.push("/");
    },
    [router, user]
  );

  const { open, ready } = usePlaidLink({ token, onSuccess });

  return (
    <>
      {variant === "primary" ? (
        <Button className="plaidlink-primary" disabled={!ready} onClick={() => open()}>
          Connect Bank
        </Button>
      ) : variant === "ghost" ? (
        <Button className="plaidlink-ghost" variant="ghost" onClick={() => open()}>
          Connect Bank
        </Button>
      ) : (
        <Button className="plaidlink-default" onClick={() => open()}>
          <Image src="/icons/connect-bank.svg" alt="Connect Bank" width={24} height={24} />
          <p className="hidden text-[16px] font-semibold text-black-2 xl:block">Connect Bank</p>
        </Button>
      )}
    </>
  );
}

export default PlaidLink;
