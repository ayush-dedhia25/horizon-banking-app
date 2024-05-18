"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { ID, Query } from "node-appwrite";
import {
  CountryCode,
  LinkTokenCreateRequest,
  ProcessorTokenCreateRequest,
  ProcessorTokenCreateRequestProcessorEnum,
  Products,
} from "plaid";

import { createAdminClient, createSessionClient } from "../appwrite";
import { plaidClient } from "../plaid";
import { encryptId, extractCustomerIdFromUrl, parseStringify } from "../utils";
import { addFundingSource, createDwollaCustomer } from "./dwolla.actions";

const {
  APPWRITE_DATABASE_ID: DATABASE_ID,
  APPWRITE_USER_COLLECTION_ID: USER_COLLECTION_ID,
  APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID,
} = process.env;

const getUserInfo = async ({ userId }: getUserInfoProps) => {
  try {
    const { database } = await createAdminClient();
    const user = await database.listDocuments(DATABASE_ID!, USER_COLLECTION_ID!, [
      Query.equal("userId", [userId]),
    ]);
    return parseStringify(user.documents[0]);
  } catch (err) {
    console.log("Error at [GET_USER_INFO_ACTION]:", err);
  }
};

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

    const user = await getUserInfo({ userId: session.userId });

    return parseStringify(user);
  } catch (err) {
    console.log("Error at [SIGN_IN_ACTION]:", err);
  }
};

export const signUp = async ({ password, ...userData }: SignUpParams) => {
  const { email, firstName, lastName } = userData;

  let newUserAccount;

  try {
    const { account, database } = await createAdminClient();

    newUserAccount = await account.create(ID.unique(), email, password, `${firstName} ${lastName}`);
    if (!newUserAccount) throw new Error("Error creating new user");

    const dwollaCustomerUrl = await createDwollaCustomer({ ...userData, type: "personal" });
    if (!dwollaCustomerUrl) {
      throw new Error("Error creating dwolla customer");
    }

    const dwollaCustomerId = extractCustomerIdFromUrl(dwollaCustomerUrl);

    const newUser = await database.createDocument(DATABASE_ID!, USER_COLLECTION_ID!, ID.unique(), {
      ...userData,
      userId: newUserAccount.$id,
      dwollaCustomerId,
      dwollaCustomerUrl,
    });

    const session = await account.createEmailPasswordSession(email, password);

    cookies().set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    return parseStringify(newUser);
  } catch (err) {
    console.log("Error at [SIGN_UP_ACTION]:", err);
  }
};

export const getLoggedInUser = async () => {
  try {
    const { account } = await createSessionClient();
    const result = await account.get();
    const user = await getUserInfo({ userId: result.$id });
    return parseStringify(user);
  } catch (err) {
    console.log("Error at [GET_LOGGED_IN_USER_ACTION]:", err);
    return null;
  }
};

export const logoutAccount = async () => {
  try {
    const { account } = await createSessionClient();
    cookies().delete("appwrite-session");
    await account.deleteSession("current");
  } catch (err) {
    console.log("Error at [LOGOUT_ACTION]:", err);
    return null;
  }
};

export const createLinkToken = async (user: User) => {
  try {
    const tokenParams: LinkTokenCreateRequest = {
      user: {
        client_user_id: user.$id,
      },
      client_name: `${user.firstName} ${user.lastName}`,
      products: ["auth"] as Products[],
      language: "en",
      country_codes: ["US"] as CountryCode[],
    };

    const response = await plaidClient.linkTokenCreate(tokenParams);
    return parseStringify({ linkToken: response.data.link_token });
  } catch (err) {
    console.log("Error at [CREATE_LINK_TOKEN_ACTION]:", err);
  }
};

export const createBankAccount = async ({
  accessToken,
  fundingSourceUrl,
  userId,
  bankId,
  accountId,
  sharableId,
}: createBankAccountProps) => {
  try {
    const { database } = await createAdminClient();

    const bankAccount = await database.createDocument(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      ID.unique(),
      { accessToken, fundingSourceUrl, userId, bankId, accountId, sharableId }
    );

    return parseStringify(bankAccount);
  } catch (err) {
    console.log("Error at [CREATE_BANK_ACCOUNT_ACTION]:", err);
  }
};

export const exchangePublicToken = async ({ publicToken, user }: exchangePublicTokenProps) => {
  try {
    const response = await plaidClient.itemPublicTokenExchange({ public_token: publicToken });
    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;

    // Get account information from Plaid using access token
    const accountsResponse = await plaidClient.accountsGet({ access_token: accessToken });
    const accountData = accountsResponse.data.accounts[0];

    // Create a processor token from Dwolla using the access token and account ID
    const request: ProcessorTokenCreateRequest = {
      access_token: accessToken,
      account_id: accountData.account_id,
      processor: "dwolla" as ProcessorTokenCreateRequestProcessorEnum,
    };

    const processorTokenResponse = await plaidClient.processorTokenCreate(request);
    const processorToken = processorTokenResponse.data.processor_token;

    // Create a funding source URL for the account using the Dwolla customer ID, processor token and the bank name.
    const fundingSourceUrl = await addFundingSource({
      processorToken,
      dwollaCustomerId: user.dwollaCustomerId,
      bankName: accountData.name,
    });
    if (!fundingSourceUrl) throw Error;

    // Create a bank account using the user ID, item ID, account ID, access token, funding source URL and shareable ID
    await createBankAccount({
      accessToken,
      fundingSourceUrl,
      userId: user.$id,
      bankId: itemId,
      accountId: accountData.account_id,
      sharableId: encryptId(accountData.account_id),
    });

    revalidatePath("/");

    return parseStringify({ publicTokenExchange: "complete" });
  } catch (err) {
    console.log("Error at [EXCHANGE_PUBLIC_TOKEN_ACTION]:", err);
  }
};

export const getBank = async ({ documentId }: getBankProps) => {
  try {
    const { database } = await createAdminClient();
    const bank = await database.listDocuments(DATABASE_ID!, BANK_COLLECTION_ID!, [
      Query.equal("$id", [documentId]),
    ]);
    return parseStringify(bank.documents[0]);
  } catch (err) {
    console.log("Error at [GET_BANK_ACTION]:", err);
  }
};

export const getBanks = async ({ userId }: getBanksProps) => {
  try {
    const { database } = await createAdminClient();
    const banks = await database.listDocuments(DATABASE_ID!, BANK_COLLECTION_ID!, [
      Query.equal("userId", [userId]),
    ]);
    return parseStringify(banks.documents);
  } catch (err) {
    console.log("Error at [GET_BANKS_ACTION]:", err);
  }
};

export const getBankByAccountId = async ({ accountId }: getBankByAccountIdProps) => {
  try {
    const { database } = await createAdminClient();

    const bank = await database.listDocuments(DATABASE_ID!, BANK_COLLECTION_ID!, [
      Query.equal("accountId", [accountId]),
    ]);

    if (bank.total !== 1) return null;

    return parseStringify(bank.documents[0]);
  } catch (err) {
    console.log("Error at [GET_BANK_BY_ACCOUNT_ID_ACTION]:", err);
  }
};
