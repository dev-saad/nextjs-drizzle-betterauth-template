"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { onboardingFormSchema } from "@/features/onboarding/schema";
import { useRouter } from "next/navigation";

const Section = ({
 title,
 children,
}: {
 title: string;
 children: React.ReactNode;
}) => (
 <Card>
  <CardHeader>
   <CardTitle className="text-base font-semibold text-foreground">
    {title}
   </CardTitle>
  </CardHeader>
  <CardContent className="grid gap-4 text-sm">{children}</CardContent>
 </Card>
);

const Item = ({ label, value }: { label: string; value?: string | null }) => (
 <div className="flex flex-wrap items-center justify-between max-w-full">
  <span className="text-muted-foreground font-medium">{label}</span>
  <span className="text-foreground font-medium text-right flex-1 max-w-[60%] wrap-break-word">
   {value || "-"}
  </span>
 </div>
);
const ReviewStep = ({ form }: { form: any }) => {
 const parsedForm = onboardingFormSchema.safeParse(form.state.values);
 const values = parsedForm.data;
 const router = useRouter();

 if (parsedForm.error || !values) {
  window && router.back();
  return;
 }

 return (
  <div className="space-y-6">
   <Section title="Personal Information">
    <Item label="Name" value={values.user?.name} />
    <Separator />
    <Item label="Phone" value={values.user?.phone} />
   </Section>

   <Section title="Business Information">
    <Item label="Type" value={values.organization?.settings?.businessType} />
    <Separator />
    <Item
     label="Category"
     value={values.organization?.settings?.businessCategory}
    />
    <Separator />
    <Item
     label="Website"
     value={values.organization?.settings?.businessWebsite}
    />
    <Separator />
    <Item
     label="Facebook"
     value={values.organization?.settings?.businessFacebookUrl}
    />
    <Separator />
    <Item
     label="Instagram"
     value={values.organization?.settings?.businessInstagramUrl}
    />
    <Separator />
    <Item
     label="Registration Number"
     value={values.organization?.settings?.businessRegistrationNumber}
    />
   </Section>

   <Section title="Organization Details">
    <Item label="Organization Name" value={values.organization?.name} />
    <Separator />
    <Item
     label="Address Line 1"
     value={values.organization?.settings?.addressLine1}
    />
    <Separator />
    <Item
     label="Address Line 2"
     value={values.organization?.settings?.addressLine2}
    />
    <Separator />
    <Item label="City" value={values.organization?.settings?.addressCity} />
    <Separator />
    <Item label="State" value={values.organization?.settings?.addressState} />
    <Separator />
    <Item
     label="Postal Code"
     value={values.organization?.settings?.addressPostalCode}
    />
    <Separator />
    <Item
     label="Country"
     value={values.organization?.settings?.addressCountry}
    />
    <Separator />
    <Item
     label="Currency"
     value={values.organization?.settings?.localeCurrency}
    />
    <Separator />
    <Item
     label="Timezone"
     value={values.organization?.settings?.localeTimezone}
    />
   </Section>
  </div>
 );
};

export default ReviewStep;
