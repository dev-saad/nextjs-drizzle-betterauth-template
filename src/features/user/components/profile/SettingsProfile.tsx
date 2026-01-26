"use client";

import {
 updateUser,
 upsertUserAdditional,
 UserWithAdditionalType,
} from "@/actions/server/user.controllers";
import { useAppForm } from "@/components/global/form";
import {
 CardContent,
 CardDescription,
 CardHeader,
 CardTitle,
} from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Typography } from "@/components/ui/typography";
import { getStorageUrl } from "@/lib/utils/files";
import { createAvatar } from "@dicebear/core";
import * as dylan from "@dicebear/dylan";
import { SiGithub, SiX } from "@icons-pack/react-simple-icons";
import { User2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { toast } from "sonner";
import { userProfileFormSchema, UserProfileFormSchemaType } from "../../schema";

const SettingsProfile = ({ user }: { user: UserWithAdditionalType }) => {
 const router = useRouter();
 const userProfileImg = getStorageUrl(user?.image);
 const form = useAppForm({
  defaultValues: {
   name: user?.name ?? "",
   phone: user?.phone ?? "",
   bio: user?.bio ?? "",
   website: user?.website ?? "",
   socialLinks: user?.socialLinks ?? { twitter: "", github: "", linkedin: "" },
   avatar: userProfileImg,
  } as UserProfileFormSchemaType,
  validators: {
   onChange: userProfileFormSchema,
  },
  onSubmit: async ({ value }) => {
   const { name, phone, avatar, ...additional } = value;
   const { success, error, status } = await updateUser({
    name,
    phone, // Update phone in core user
    image: avatar,
   });

   if (!success || !!error) {
    toast.error(`Error updating user info: ${error}`);
    return;
   }

   const {
    success: additionalSuccess,
    error: additionalError,
    status: additionalStatus,
   } = await upsertUserAdditional(additional);

   if (status === "unchanged" && additionalStatus === "unchanged") {
    toast.info("No changes detected!");
    return;
   }

   if (!additionalSuccess || !!additionalError) {
    toast.error(`Error updating user info: ${additionalError}`);
    return;
   }
   toast.success("Profile updated successfully");
   form.reset();
   router.refresh();
  },
 });

 const avatar = useMemo(() => {
  return createAvatar(dylan, {
   seed: user?.id ?? "",
   size: 48,
   randomizeIds: true,
  }).toDataUri();
 }, []);

 const { getFieldValue } = form;
 return (
  <>
   <CardHeader>
    <CardTitle>Profile Settings</CardTitle>
    <CardDescription>
     Manage your profile information and avatar
    </CardDescription>
   </CardHeader>
   <Separator />
   <CardContent>
    <form
     id="profile-form"
     onSubmit={(e) => {
      e.preventDefault();
      form.handleSubmit();
     }}>
     <FieldGroup>
      <form.AppField name="avatar">
       {(field) => (
        <field.UploadField
         AvatarIcon={User2}
         defaultAvatar={userProfileImg ?? avatar}
         label="Profile picture"
         onRemove={async () => {
          const file = await fetch(avatar)
           .then((res) => res.blob())
           .then(
            (blob) => new File([blob], "avatar.svg", { type: "image/svg+xml" }),
           );
          field.setValue(file);
         }}
         className="object-contain"
        />
       )}
      </form.AppField>

      {/* Personal Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
       <form.AppField name="name">
        {(field) => (
         <field.InputField label="Name" placeholder="Enter your name" />
        )}
       </form.AppField>
       <form.AppField name="phone">
        {(field) => (
         <field.InputField
          label="Phone"
          type="tel"
          placeholder="Enter your phone number"
         />
        )}
       </form.AppField>
       <div className="md:col-span-2">
        <form.AppField name="website">
         {(field) => (
          <field.InputField
           label="Website"
           required={false}
           placeholder="https://example.com"
          />
         )}
        </form.AppField>
       </div>
      </div>

      <form.AppField name="bio">
       {(field) => (
        <field.TextareaField
         label="Bio"
         placeholder="Tell us a little bit about yourself"
        />
       )}
      </form.AppField>

      <Separator className="my-4" />

      {/* Social Links */}
      <Typography variant="h4" as="h3">
       Social Profiles
      </Typography>
      <form.AppField name="socialLinks.github">
       {(field) => (
        <field.InputField
         placeholder="Enter your GitHub profile URL"
         AddonLeft={<SiGithub />}
        />
       )}
      </form.AppField>
      <form.AppField name="socialLinks.linkedin">
       {(field) => (
        <field.InputField
         placeholder="Enter your LinkedIn profile URL"
         AddonLeft={
          <svg
           xmlns="http://www.w3.org/2000/svg"
           viewBox="68 68 490 490"
           className="size-4 fill-primary">
           <path d="M512 96L127.9 96C110.3 96 96 110.5 96 128.3L96 511.7C96 529.5 110.3 544 127.9 544L512 544C529.6 544 544 529.5 544 511.7L544 128.3C544 110.5 529.6 96 512 96zM231.4 480L165 480L165 266.2L231.5 266.2L231.5 480L231.4 480zM198.2 160C219.5 160 236.7 177.2 236.7 198.5C236.7 219.8 219.5 237 198.2 237C176.9 237 159.7 219.8 159.7 198.5C159.7 177.2 176.9 160 198.2 160zM480.3 480L413.9 480L413.9 376C413.9 351.2 413.4 319.3 379.4 319.3C344.8 319.3 339.5 346.3 339.5 374.2L339.5 480L273.1 480L273.1 266.2L336.8 266.2L336.8 295.4L337.7 295.4C346.6 278.6 368.3 260.9 400.6 260.9C467.8 260.9 480.3 305.2 480.3 362.8L480.3 480z" />
          </svg>
         }
        />
       )}
      </form.AppField>
      <form.AppField name="socialLinks.twitter">
       {(field) => (
        <field.InputField
         placeholder="Enter your Twitter profile URL"
         AddonLeft={<SiX />}
        />
       )}
      </form.AppField>
      <Separator className="my-4" />
      <form.AppForm>
       <form.ActionButtons
        sticky
        submitButton={{
         label: "Update Profile",
        }}
        cancelButton={{
         label: "Discard Changes",
         onClick: () => form.reset(),
        }}
        position="bottom-right"
        design="card"
        submitType="update"
       />
      </form.AppForm>
     </FieldGroup>
    </form>
   </CardContent>
  </>
 );
};

export default SettingsProfile;
