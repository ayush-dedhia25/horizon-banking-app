import Image from "next/image";

import MobileNav from "@/components/MobileNav";
import Sidebar from "@/components/Sidebar";

function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const loggedIn = { firstName: "Ayush", lastName: "Dedhia" };

  return (
    <main className="flex h-screen w-full font-inter">
      <Sidebar user={loggedIn} />

      <div className="flex size-full flex-col">
        <div className="root-layout">
          <Image src="/icons/logo.svg" alt="menu icon" width={30} height={30} />
          <div>
            <MobileNav user={loggedIn} />
          </div>
        </div>
        {children}
      </div>
    </main>
  );
}

export default RootLayout;
