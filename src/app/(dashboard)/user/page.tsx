import { ROUTES } from "@/lib/constants/routes";
import { redirect } from "next/navigation";

const AccountPage = () => {
 redirect(ROUTES.USER.DEFAULT);
};

export default AccountPage;
