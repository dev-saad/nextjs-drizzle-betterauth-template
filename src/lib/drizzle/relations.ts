import { defineRelations } from "drizzle-orm";
import * as schema from "./schemas/schema";

export const relations = defineRelations(schema, (r) => ({
 users: {
  session: r.many.sessions({
   from: r.users.id,
   to: r.sessions.userId,
  }),
  account: r.many.accounts({
   from: r.users.id,
   to: r.accounts.userId,
  }),
  member: r.many.members({
   from: r.users.id,
   to: r.members.userId,
  }),
  invitation: r.many.invitations({
   from: r.users.id,
   to: r.invitations.inviterId,
  }),
  userAdditional: r.one.userAdditional({
   from: r.users.id,
   to: r.userAdditional.userId,
  }),
 },

 userAdditional: {
  user: r.one.users({
   from: r.userAdditional.userId,
   to: r.users.id,
  }),
 },

 sessions: {
  user: r.one.users({
   from: r.sessions.userId,
   to: r.users.id,
  }),
 },

 accounts: {
  user: r.one.users({
   from: r.accounts.userId,
   to: r.users.id,
  }),
 },

 members: {
  user: r.one.users({
   from: r.members.userId,
   to: r.users.id,
  }),
  organization: r.one.organizations({
   from: r.members.organizationId,
   to: r.organizations.id,
  }),
 },

 invitations: {
  organization: r.one.organizations({
   from: r.invitations.organizationId,
   to: r.organizations.id,
  }),
  user: r.one.users({
   from: r.invitations.inviterId,
   to: r.users.id,
  }),
 },

 organizations: {
  members: r.many.members(),
  invitations: r.many.invitations(),
  auditLogs: r.many.auditLogs(),
  settings: r.one.organizationSettings(),
 },

 organizationSettings: {
  organization: r.one.organizations({
   from: r.organizationSettings.organizationId,
   to: r.organizations.id,
  }),
 },

 organizationRoles: {},

 twoFactor: {
  user: r.one.users({
   from: r.twoFactor.userId,
   to: r.users.id,
  }),
 },

 // Others
 auditLogs: {
  organization: r.one.organizations({
   from: r.auditLogs.organizationId,
   to: r.organizations.id,
  }),
  user: r.one.users({
   from: r.auditLogs.userId,
   to: r.users.id,
  }),
 },
}));
