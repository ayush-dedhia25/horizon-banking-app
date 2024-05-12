import HeaderBox from "@/components/HeaderBox";
import RightSidebar from "@/components/RightSidebar";
import TotalBalanceBox from "@/components/TotalBalanceBox";
import { getLoggedInUser } from "@/lib/actions/user.actions";

async function RootPage() {
  const loggedIn = await getLoggedInUser();

  return (
    <section className="home">
      <div className="home-content">
        <header className="home-header">
          <HeaderBox
            type="greeting"
            title="Welcome"
            user={loggedIn?.name}
            subtext="Access and manage your account and transactions efficiently."
          />
          <TotalBalanceBox accounts={[]} totalBanks={1} totalCurrentBalance={136250.35} />
        </header>
        RECENT TRANSACTIONS
      </div>
      <RightSidebar
        user={loggedIn}
        transactions={[]}
        banks={[{ currentBalance: 123.6 }, { currentBalance: 456.8 }]}
      />
    </section>
  );
}

export default RootPage;
