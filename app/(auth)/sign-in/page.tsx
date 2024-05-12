import AuthForm from "@/components/AuthForm";

function SignInPage() {
  return (
    <section className="flex-center size-full max-sm:px-6">
      <AuthForm type="sign-in" />
    </section>
  );
}

export default SignInPage;
