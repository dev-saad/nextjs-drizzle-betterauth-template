import { verifyAndEnableTOTP } from "@/actions/server/auth.controllers";
import { useAppForm } from "@/components/global/form";
import InfoAlert from "@/components/global/InfoAlert";
import {
 Card,
 CardContent,
 CardDescription,
 CardHeader,
 CardTitle,
} from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { TOTPStepFormSchema } from "@/features/user/schema";
import { QUERY_KEYS, QUERY_VALUES, ROUTES } from "@/lib/constants/routes";
import { useTwoFactor } from "@/lib/context/two-factor-context";
import { Route } from "next";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";
import { toast } from "sonner";

const TOTPStep = () => {
 const router = useRouter();
 const form = useAppForm({
  defaultValues: {
   code: "",
   trustDevice: false,
  },
  validators: {
   onChange: TOTPStepFormSchema,
  },
  onSubmit: async ({ value }) => {
   const { data, success, error } = await verifyAndEnableTOTP({
    code: value.code,
    trustDevice: value.trustDevice,
   });
   if (!success || error) {
    toast.error(error || "Failed to verify OTP.");
   }
   if (success && data) {
    router.refresh();
    router.push(
     `${ROUTES.USER.TWO_FACTOR}?${QUERY_KEYS.step}=${QUERY_VALUES.twoFactorSteps[1]}` as Route,
    );
   }
  },
 });
 const { totpURI } = useTwoFactor();

 if (!totpURI) {
  return <Skeleton className="w-full h-[200px] rounded-xl" />;
 }

 return (
  <Card>
   <CardHeader>
    <CardTitle>Scan QR Code</CardTitle>
    <CardDescription>
     Scan the QR code with your authenticator app (Google Authenticator, Authy,
     etc.)
    </CardDescription>
   </CardHeader>
   <CardContent className="flex flex-col gap-4">
    <InfoAlert
     description="To enable two-factor authentication, you need to finish this step"
     title="Required"
    />
    <div className="flex justify-center p-6 bg-white rounded-xl border border-border/50">
     <QRCode value={totpURI} size={180} />
    </div>
    <form
     onSubmit={(e) => {
      e.preventDefault();
      form.handleSubmit();
     }}>
     <FieldGroup className="flex flex-col items-center">
      <div className="w-fit">
       <form.AppField name="code">
        {(field) => (
         <field.InputField
          id="code"
          name="code"
          type="otp"
          otpLength={6}
          className=""
         />
        )}
       </form.AppField>
      </div>
      <form.AppField name="trustDevice">
       {(field) => <field.CheckboxField label="Trust this device" />}
      </form.AppField>
      <form.AppForm>
       <div className="w-full">
        <form.SubmitButton className="w-full">
         Verify & Enable
        </form.SubmitButton>
       </div>
      </form.AppForm>
     </FieldGroup>
    </form>
   </CardContent>
  </Card>
 );
};

export default TOTPStep;
