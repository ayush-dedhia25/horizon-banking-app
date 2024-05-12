import AuthForm from "@/components/AuthForm";
import { getLoggedInUser } from "@/lib/actions/user.actions";

async function SignUpPage() {
  const loggedInUser = await getLoggedInUser();

  return (
    <section className="flex-center size-full max-sm:px-6">
      <AuthForm type="sign-up" />
    </section>
  );
}

export default SignUpPage;
