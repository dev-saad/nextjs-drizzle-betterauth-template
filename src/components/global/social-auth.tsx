"use client";

import { signInSocial } from "@/actions/client/auth.client";
import {
 getAccountInfo,
 linkSocialAccount,
 unlinkSocialAccount,
} from "@/actions/server/auth.controllers";
import { UserAccountsType } from "@/actions/server/user.controllers";
import { AppAlertDialog } from "@/components/global/AppAlertDialog";
import { Button } from "@/components/ui/button";
import { PROVIDER_CONFIG } from "@/lib/constants/social-providers";
import { cn } from "@/lib/utils";
import { SocialProvider } from "better-auth/social-providers";
import { CheckCircle2, ExternalLink, Loader2, Unlink } from "lucide-react";
import { useRouter } from "next/navigation";
import React, {
 cloneElement,
 isValidElement,
 useEffect,
 useState,
} from "react";
import { toast } from "sonner";
import { Skeleton } from "../ui/skeleton";
import InsideCard from "./InsideCard";
import { Tooltip } from "./Tooltip";

export interface SocialAuthProps {
 mode: "connect" | "signin" | "signup";
 accounts?: UserAccountsType;
 providers?: SocialProvider[];
 isLoading?: boolean;
 className?: string;
}

const SocialAuthRow = ({
 provider,
 account,
 onConnect,
 onDisconnect,
 loadingProvider,
 externalLoading,
}: {
 provider: SocialProvider;
 account?: { providerId: string; accountId: string; [key: string]: any };
 onConnect: (provider: SocialProvider) => void;
 onDisconnect: (provider: SocialProvider) => void;
 loadingProvider: SocialProvider | null;
 externalLoading: boolean;
}) => {
 const config = PROVIDER_CONFIG[provider];
 const Icon = config?.icon;
 const isLoading = loadingProvider === provider || externalLoading;
 const isConnected = !!account;

 const [details, setDetails] = useState<{ email?: string; name?: string }>({
  email: account?.email,
  name: account?.name,
 });

 useEffect(() => {
  if (!isConnected) {
   setDetails({
    email: undefined,
    name: undefined,
   });
   return;
  }
  if (isConnected && account?.accountId && !details.email) {
   getAccountInfo({ accountId: account.accountId }).then((res) => {
    if (res?.data) {
     setDetails({
      email: res.data.email || undefined,
      name: res.data.name || undefined,
     });
    }
   });
  }
 }, [isConnected, account, details.email]);

 return (
  <InsideCard contentClassName="flex items-center px-3" className="py-3">
   <div className="flex min-w-0 flex-1 items-center gap-3">
    <div
     className={cn(
      "flex size-10 shrink-0 items-center justify-center rounded-lg",
      isConnected ? "bg-muted" : "bg-muted/50",
     )}>
     {/* {Icon && <Icon className={cn("size-5", config?.color)} />} */}
     {Icon &&
      (isValidElement(Icon)
       ? cloneElement(Icon as React.ReactElement<{ className?: string }>, {
          className: cn("size-5", config?.color),
         })
       : (() => {
          const IconComponent = Icon as React.ComponentType<{
           className?: string;
           style?: React.CSSProperties;
          }>;
          return (
           <IconComponent
            className={cn("size-5", config?.color)}
            style={{ color: config?.iconColor }}
           />
          );
         })())}
    </div>
    <div className="flex min-w-0 flex-1 flex-col gap-1">
     <div className="flex items-center gap-2">
      <span className="font-medium text-sm">{config?.name}</span>
      {isConnected && <CheckCircle2 className="size-3.5 text-primary" />}
     </div>
     {details.email ? (
      <p className="text-muted-foreground text-xs truncate">{details.email}</p>
     ) : isConnected ? (
      <Skeleton className="h-4 w-28" />
     ) : null}
    </div>
   </div>

   <div className="flex shrink-0 items-center gap-2">
    {isConnected ? (
     <AppAlertDialog
      trigger={
       <div>
        <Tooltip content={<p>Unlink {config?.name}</p>}>
         <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled={isLoading}>
          <Unlink className="size-4" />
         </Button>
        </Tooltip>
       </div>
      }
      title={`Disconnect ${config?.name}?`}
      description="Are you sure you want to disconnect this account?"
      actionText="Disconnect"
      variant="destructive"
      onAction={() => onDisconnect(provider)}
     />
    ) : (
     <Button
      variant="outline"
      size="sm"
      disabled={isLoading}
      onClick={() => onConnect(provider)}>
      {isLoading ? (
       <Loader2 className="size-4 animate-spin" />
      ) : (
       <>
        <ExternalLink className="mr-2 size-4 max-sm:hidden" />
        <span>Connect</span>
       </>
      )}
     </Button>
    )}
   </div>
  </InsideCard>
 );
};

export default function SocialAuth({
 mode,
 accounts,
 providers = ["google"],
 isLoading: externalLoading = false,
 className,
}: SocialAuthProps) {
 const router = useRouter();
 const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(
  null,
 );

 const handleConnect = async (provider: SocialProvider) => {
  setLoadingProvider(provider);
  try {
   if (mode === "connect") {
    // Invoke server action that triggers better-auth API to get redirect URL
    const res = await linkSocialAccount(provider);
    if (res?.data?.url) {
     window.location.href = res.data.url;
    } else {
     toast.error("Failed to initiate connection");
    }
   } else {
    // Sign In / Sign Up
    await signInSocial({ provider, signUp: mode === "signup" });
   }
  } catch (error) {
   toast.error("An error occurred");
   console.error(error);
  } finally {
   // Don't clear loading if redirecting... but good practice to clear if error
   // For redirect, page unloads usually
   setLoadingProvider(null);
  }
 };

 const handleDisconnect = async (provider: SocialProvider) => {
  setLoadingProvider(provider);
  const { data, success, error } = await unlinkSocialAccount(provider);
  if (!success || !!error) {
   toast.error(`Error unlinking ${provider} account: ${error}`);
   setLoadingProvider(null);
   return;
  }
  toast.success(`Unlinked ${provider} account successfully`);
  setLoadingProvider(null);
  router.refresh();
 };

 const renderConnectMode = () => {
  return (
   <div className="flex flex-col gap-3">
    {providers.map((p) => {
     const existing = accounts?.find((a) => a.providerId === p);
     return (
      <SocialAuthRow
       key={p}
       provider={p}
       account={existing}
       onConnect={handleConnect}
       onDisconnect={handleDisconnect}
       loadingProvider={loadingProvider}
       externalLoading={externalLoading}
      />
     );
    })}
   </div>
  );
 };

 const renderAuthMode = () => {
  // For SignIn/SignUp, just show buttons
  return (
   <div className={cn("flex flex-col gap-3", className)}>
    {providers.map((p) => {
     const config = PROVIDER_CONFIG[p];
     if (!config) return null;
     const Icon = config.icon;
     const isLoading = loadingProvider === p || externalLoading;
     return (
      <Button
       key={p}
       variant="outline"
       type="button"
       className="w-full"
       disabled={isLoading}
       onClick={() => handleConnect(p)}>
       {isLoading ? (
        <Loader2 className="mr-2 size-4 animate-spin" />
       ) : (
        <>
         {Icon &&
          (isValidElement(Icon)
           ? cloneElement(Icon as React.ReactElement<{ className?: string }>, {
              className: cn("mr-2 size-4", config?.color),
             })
           : (() => {
              const IconComponent = Icon as React.ComponentType<{
               className?: string;
               style?: React.CSSProperties;
              }>;
              return (
               <IconComponent
                className={cn("mr-2 size-4", config?.color)}
                style={{ color: config?.iconColor }}
               />
              );
             })())}
        </>
       )}
       Continue with {config.name}
      </Button>
     );
    })}
   </div>
  );
 };

 if (mode === "connect") {
  return renderConnectMode();
 }
 return renderAuthMode();
}
