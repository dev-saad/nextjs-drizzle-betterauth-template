import {
 DashboardContent,
 DashboardTitle,
} from "@/components/global/Dashboard";
import OrganizationForm from "@/features/organization/components/OrganizationForm";

const CreateOrganizationPage = () => {
 return (
  <DashboardContent className="w-full max-w-5xl mx-auto">
   <DashboardTitle mainTitle="Create Organization" section="Organization" />
   <OrganizationForm mode="create" />
  </DashboardContent>
 );
};

export default CreateOrganizationPage;
