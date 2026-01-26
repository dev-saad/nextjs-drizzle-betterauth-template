"use client";

import { createOrganization } from "@/actions/server/organization.controllers";
import { updateUser } from "@/actions/server/user.controllers";
import { useFormPersist } from "@/components/global/form/use-form-persist";
import Loader from "@/components/kokonutui/loader";
import { Typography } from "@/components/ui/typography";
import { User } from "@/lib/auth/auth.config";
import { QUERY_VALUES, ROUTE_BUILDER, ROUTES } from "@/lib/constants/routes";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { useRouter } from "next/navigation";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useCallback, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useAppForm } from "../../../components/global/form";
import ShimmerText from "../../../components/kokonutui/shimmer-text";
import { Button } from "../../../components/ui/button";
import {
 Card,
 CardContent,
 CardFooter,
 CardHeader,
 CardTitle,
} from "../../../components/ui/card";
import {
 Stepper,
 StepperContent,
 StepperDescription,
 StepperIndicator,
 StepperItem,
 StepperList,
 StepperNext,
 StepperPrev,
 StepperProps,
 StepperSeparator,
 StepperTitle,
 StepperTrigger,
} from "../../../components/ui/stepper";
import { steps } from "../constants";
import { onboardingFormOptions } from "../form-config";
import { onboardingFormSchema } from "../schema";
import BusinessStep from "./steps/BusinessStep";
import OrganizationStep from "./steps/OrganizationStep";
import PersonalInfoStep from "./steps/PersonalInfoStep";
import ReviewStep from "./steps/ReviewStep";

const OnboardingSteps = ({ user }: { user: User }) => {
 const router = useRouter();
 const [step, setStep] = useQueryState(
  "step",
  parseAsStringLiteral(QUERY_VALUES.onboardingSteps)
   .withDefault("personal")
   .withOptions({ history: "replace" }),
 );

 const form = useAppForm({
  defaultValues: {
   ...onboardingFormOptions.defaultValues,
   user: {
    name: user.name ?? "",
    phone: user.phone ?? "",
   },
  },
  validators: {
   onChange: onboardingFormSchema,
  },
  onSubmit: async ({ value }) => {
   try {
    const transformedData = onboardingFormSchema.parse(value);
    //  create organization
    const {
     success: orgSuccess,
     error: orgError,
     data: orgData,
    } = await createOrganization({
     ...transformedData.organization,
    });
    if (!orgSuccess || !orgData?.org) {
     toast.error(`Organization creation failed: ${orgError}`);
     return;
    }
    //  update user
    const { success: userSuccess, error: userError } = await updateUser({
     name: transformedData.user.name,
     phone: transformedData.user.phone,
    });
    if (!userSuccess) {
     toast.error(`User update failed: ${userError}`);
     return;
    }
    clearPersistedState();
    form.reset();
    router.replace(
     ROUTE_BUILDER.organization(orgData?.org?.id, ROUTES.ORGANIZATION.DEFAULT),
    );
   } catch (error) {
    toast.error(`Submission failed: ${error}`);
   }
  },
 });

 // Add persistence to the form
 const { clearPersistedState } = useFormPersist(form, {
  key: "onboarding-form",
  storage: "sessionStorage", // Can be changed to 'sessionStorage' or 'cookie'
  debounceMs: 500,
  cookieOptions: {
   maxAge: 60 * 60 * 24,
  },
  // exclude: ["organization.logo"], // Exclude file uploads from persistence
 });

 const stepIndex = useMemo(
  () => steps.findIndex((s) => s.value === step),
  [step],
 );

 const onValidate: NonNullable<StepperProps["onValidate"]> = useCallback(
  async (_value, direction) => {
   if (direction === "prev") return true;

   const stepData = steps.find((s) => s.value === step);
   if (!stepData) return true;

   // Trigger validation for all fields
   await Promise.all(
    stepData.fields.map((field) => form.validateField(field, "change")),
   );

   // Check if form is valid
   const isValid = stepData.fields.every(
    (field) => !form.getAllErrors().fields[field],
   );

   if (!isValid) {
    toast.info("Please complete all required fields to continue");
   }

   return isValid;
  },
  [form, step],
 );

 useEffect(() => {
  if (stepIndex <= 0) return;

  const result = onboardingFormSchema.safeParse(form.state.values);

  if (!result.success) {
   const errors = result.error.issues;

   for (let i = 0; i < stepIndex; i++) {
    const previousStep = steps[i];
    const stepHasErrors = previousStep.fields.some((field) =>
     errors.some((error) => error.path.join(".") === field),
    );

    if (stepHasErrors) {
     toast.error(`Please complete the ${previousStep.title} step first`);
     setStep(previousStep.value);
     return;
    }
   }
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);
 return (
  <div className="w-full h-full my-auto flex flex-col items-center">
   <AnimatePresence mode="wait">
    {step !== QUERY_VALUES.onboardingSteps[4] ? (
     <m.div
      key="form-step"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full">
      <ShimmerText
       text="Onboarding"
       className="text-4xl font-bold font-serif "
       color="primary"
      />
      <div className="mt-5 w-full">
       <Stepper
        value={step}
        onValueChange={(value) => setStep(value as typeof step)}
        onValidate={onValidate}>
        <form
         id="onboarding-form"
         onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
         }}>
         <StepperList>
          {steps.map((step) => (
           <StepperItem key={step.value} value={step.value}>
            <StepperTrigger>
             <StepperIndicator />
             <div className="flex flex-col gap-1">
              <StepperTitle>{step.title}</StepperTitle>
              <StepperDescription>{step.description}</StepperDescription>
             </div>
            </StepperTrigger>
            <StepperSeparator className="mx-4" />
           </StepperItem>
          ))}
         </StepperList>
         <Card className="w-full max-w-lg mx-auto mt-10">
          <CardHeader className="flex flex-col items-center">
           <CardTitle>
            <Typography variant="h4">{steps[stepIndex]?.title}</Typography>
           </CardTitle>
          </CardHeader>
          <CardContent className="overflow-hidden">
           <StepperContent value="personal">
            <PersonalInfoStep form={form} />
           </StepperContent>
           <StepperContent value="business">
            <BusinessStep form={form} />
           </StepperContent>
           <StepperContent value="organization">
            <OrganizationStep form={form} />
           </StepperContent>
           <StepperContent value="review">
            <ReviewStep form={form} />
           </StepperContent>
          </CardContent>
          <CardFooter className="flex flex-col-reverse items-center gap-5">
           <div className="text-muted-foreground text-sm md:hidden">
            Step {stepIndex + 1} of {steps.length}
           </div>
           <div className="flex justify-between items-center w-full">
            <StepperPrev asChild>
             <Button type="button" variant="outline">
              Previous
             </Button>
            </StepperPrev>
            <div className="text-muted-foreground text-sm hidden md:block">
             Step {stepIndex + 1} of {steps.length}
            </div>
            {stepIndex === steps.length - 1 ? (
             <Button
              type="submit"
              onClick={() => setStep(QUERY_VALUES.onboardingSteps[4])}>
              Complete Setup
             </Button>
            ) : (
             <StepperNext asChild>
              <Button>Next</Button>
             </StepperNext>
            )}
           </div>
          </CardFooter>
         </Card>
        </form>
       </Stepper>
      </div>
     </m.div>
    ) : (
     <m.div
      key="loader-step"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full h-full flex justify-center items-center">
      <Loader
       title="Setting up your account"
       subtitle="Please wait while we prepare everything for you"
       size="lg"
      />
     </m.div>
    )}
   </AnimatePresence>
  </div>
 );
};

export default OnboardingSteps;
