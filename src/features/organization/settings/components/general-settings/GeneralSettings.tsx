"use client";

import { OrganizationType } from "@/actions/server/organization.controllers";
import OrganizationForm from "@/features/organization/components/OrganizationForm";

const GeneralSettings = ({ org }: { org: OrganizationType }) => {
 return <OrganizationForm key={org?.org?.id} mode="update" initialData={org} />;
};

export default GeneralSettings;
