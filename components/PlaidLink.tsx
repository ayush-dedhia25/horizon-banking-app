"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { PlaidLinkOnSuccess, usePlaidLink } from "react-plaid-link";

import { createLinkToken, exchangePublicToken } from "@/lib/actions/user.actions";
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
        <Button>Connect Bank</Button>
      ) : (
        <Button>Connect Bank</Button>
      )}
    </>
  );
}

export default PlaidLink;
