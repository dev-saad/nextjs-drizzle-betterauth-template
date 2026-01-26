"use client";

import { updateUser } from "@/actions/server/user.controllers";
import {
 CardContent,
 CardDescription,
 CardHeader,
 CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Typography } from "@/components/ui/typography";
import { User } from "@/lib/auth/auth.config";
import { usePromise } from "@/lib/context/server-action-context";
import { UserPreferences } from "@/lib/types/user";
import { cn } from "@/lib/utils";
import { Laptop, Moon, Palette, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import InsideCard from "../../../../components/global/InsideCard";

const SettingsPreferences = () => {
 const user = usePromise<User>("user");
 const { setTheme } = useTheme();

 const handleThemeChange = async (value: UserPreferences["theme"]) => {
  toast.loading("Updating theme...", { id: "theme" });
  const { error, success } = await updateUser({
   preferences: { theme: value },
  });
  if (error) {
   toast.error(error, { id: "theme" });
  }
  if (success) {
   toast.success("Theme updated", { id: "theme" });
   value && setTheme(value);
   // setTimeout(() => {
   // }, 600);
  }
 };

 const themes = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Laptop },
  { value: "rose", label: "Rose", color: "bg-rose-500" },
  { value: "blue", label: "Blue", color: "bg-blue-500" },
  { value: "green", label: "Green", color: "bg-green-500" },
 ];

 // const handleOrgChange = async (value: string) => {
 //  const { data, error } = await setActiveOrganization(value);
 //  if (error) {
 //   toast.error(error);
 //  } else {
 //   toast.success("Default organization updated");
 //   router.refresh();
 //  }
 // };

 return (
  <>
   <CardHeader>
    <CardTitle>Preferences</CardTitle>
    <CardDescription>Customize your interface look and feel.</CardDescription>
   </CardHeader>
   <Separator />
   <CardContent>
    <div className="grid gap-6 md:grid-cols-2">
     <div className="flex flex-col gap-4">
      <Typography variant="h4" as="h3">
       <Palette className="size-5 text-muted-foreground" />
       Appearance
      </Typography>

      <InsideCard title="Theme" icon={<Sun className="size-4" />}>
       <div className="grid grid-cols-3 gap-2">
        {themes.map((theme) => {
         const Icon = theme.icon;
         const isActive = user?.preferences?.theme === theme.value;
         return (
          <button
           key={theme.value}
           aria-label={`Select ${theme.label} theme`}
           className={cn(
            "flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all duration-200 hover:bg-accent/50 cursor-pointer",
            isActive
             ? "border-primary bg-primary/5 ring-1 ring-primary/20"
             : "border-muted hover:border-primary/50",
           )}
           onClick={() =>
            handleThemeChange(theme.value as UserPreferences["theme"])
           }>
           <div
            className={cn(
             "flex size-8 items-center justify-center rounded-full bg-muted shadow-sm",
             isActive && "bg-primary text-primary-foreground",
            )}>
            {Icon ? (
             <Icon className="size-4" />
            ) : (
             <div
              className={cn(
               "size-4 rounded-full border border-white/20",
               theme.color,
              )}
             />
            )}
           </div>
           <span
            className={cn(
             "font-medium text-xs",
             isActive ? "text-primary" : "text-muted-foreground",
            )}>
            {theme.label}
           </span>
          </button>
         );
        })}
       </div>
      </InsideCard>
     </div>
    </div>
   </CardContent>
  </>
 );
};

export default SettingsPreferences;
