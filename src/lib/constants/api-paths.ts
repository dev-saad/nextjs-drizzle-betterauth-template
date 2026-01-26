import { APP_URL } from "./config";

const API_PATHS = {
 verifyEmail: APP_URL + "/api/email/verify-email",
 requestResetPasswordEmail: APP_URL + "/api/email/request-reset-password",
 send2FAOtpEmail: APP_URL + "/api/email/two-factor-verify-code",
 sendInvitationEmail: APP_URL + "/api/email/send-invitation-email",
 acceptInvitation: APP_URL + "/api/invitation/manage",
} as const;

export default API_PATHS;
