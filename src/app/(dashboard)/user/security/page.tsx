import { getUserSessionList } from "@/actions/server/session.controllers";
import SettingsSecurity from "@/features/user/components/security/SettingsSecurity";

const SecurityPage = () => {
 const sessionsPromise = getUserSessionList();
 // const securityLogsPromise = getLogs({
 //  page: 1,
 //  limit: 20,
 //  entityTypes: ["USER", "SESSION", "SECURITY"],
 //  actions: [
 //   "CHANGE_PASSWORD",
 //   "2FA_ENABLE",
 //   "2FA_DISABLE",
 //   "REVOKE",
 //   "SIGN_IN",
 //   "SIGN_OUT",
 //   "SIGN_UP",
 //  ],
 // });

 return (
  <SettingsSecurity
   sessionsPromise={sessionsPromise}
   // securityLogsPromise={securityLogsPromise}
  />
 );
};

export default SecurityPage;
