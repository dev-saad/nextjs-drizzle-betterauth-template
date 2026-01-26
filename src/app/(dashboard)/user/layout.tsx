import { Card } from "@/components/ui/card";
import { AccountSidebar } from "@/features/user/components/AccountSidebar";
import { TwoFactorProvider } from "@/lib/context/two-factor-context";
import { ReactNode, Suspense } from "react";

const AccountLayout = ({ children }: { children: ReactNode }) => {
 return (
  <div className="container 2xl:max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 py-6 px-0 min-h-[calc(100vh-6.5rem)] relative">
   <AccountSidebar />
   <main className="flex-1">
    <TwoFactorProvider>
     <Card>
      <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
     </Card>
    </TwoFactorProvider>
   </main>
  </div>
 );
};

export default AccountLayout;
