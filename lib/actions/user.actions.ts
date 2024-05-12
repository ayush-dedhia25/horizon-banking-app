"use server";

import { cookies } from "next/headers";
import { ID } from "node-appwrite";

import { createAdminClient, createSessionClient } from "../appwrite";
import { parseStringify } from "../utils";

export const signIn = async ({ email, password }: signInProps) => {
  try {
    const { account } = await createAdminClient();
    const session = await account.createEmailPasswordSession(email, password);
    cookies().set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });
    return parseStringify(session);
  } catch (err) {
    console.log(err);
  }
};

export const signUp = async (userData: SignUpParams) => {
  const { email, password, firstName, lastName } = userData;

  try {
    const { account } = await createAdminClient();

    const newUserAccount = await account.create(
      ID.unique(),
      email,
      password,
      `${firstName} ${lastName}`
    );

    const session = await account.createEmailPasswordSession(email, password);

    cookies().set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    return parseStringify(newUserAccount);
  } catch (err) {
    console.log(err);
  }
};

export const getLoggedInUser = async () => {
  try {
    const { account } = await createSessionClient();
    const result = await account.get();
    return parseStringify(result);
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const logoutAccount = async () => {
  try {
    const { account } = await createSessionClient();
    cookies().delete("appwrite-session");
    await account.deleteSession("current");
  } catch (err) {
    return null;
  }
};
