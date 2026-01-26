import Logo from "@/components/global/Logo";
import { Card } from "@/components/ui/card";
import { FieldDescription } from "@/components/ui/field";

export default function authLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
  <section className="w-full min-h-screen flex flex-col justify-center items-center gap-5 container mx-auto py-8">
   <Logo />
   <div className="w-full max-w-sm flex flex-col gap-5">
    <Card className="w-full">{children}</Card>
    <FieldDescription className="px-6 text-center">
     By clicking continue, you agree to our <a href="#">Terms of Service</a> and{" "}
     <a href="#">Privacy Policy</a>.
    </FieldDescription>
   </div>
  </section>
 );
}
