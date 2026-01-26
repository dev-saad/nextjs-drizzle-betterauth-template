import { getUserWithAdditional } from "@/actions/server/user.controllers";
import SettingsProfile from "@/features/user/components/profile/SettingsProfile";

const ProfilePage = async () => {
 const { data: user } = await getUserWithAdditional();
 return <SettingsProfile user={user} />;
};

export default ProfilePage;
