import {
 Body,
 Button,
 Container,
 Head,
 Heading,
 Html,
 Link,
 Preview,
 Section,
 Tailwind,
 Text,
} from "@react-email/components";

export interface InvitationEmailProps {
 id: string;
 email: string;
 inviter: {
  id: string;
  name?: string;
  email: string;
 };
 organization: {
  id: string;
  name: string;
 };
 role: string;
 inviteLink: string;
}

export const InvitationEmail = ({
 inviter,
 organization,
 role,
 inviteLink,
}: InvitationEmailProps) => {
 const inviterName = inviter?.name || inviter?.email || "Someone";
 const orgName = organization?.name || "an organization";

 return (
  <Html>
   <Head />
   <Preview>You have been invited to join {orgName} on FlowKet</Preview>
   <Tailwind
    config={{
     theme: {
      extend: {
       colors: {
        brand: "#7c3aed",
       },
      },
     },
    }}>
    <Body
     style={{
      backgroundColor: "#f3f4f6",
      fontFamily: "Helvetica, Arial, sans-serif",
      paddingTop: "40px",
      paddingBottom: "40px",
     }}>
     <Container
      style={{
       margin: "0 auto",
       padding: "20px",
       width: "100%",
       maxWidth: "480px",
      }}>
      {/* Logo Section */}
      <Section style={{ textAlign: "center", marginBottom: "32px" }}>
       <Link
        href="https://flowket.com"
        style={{
         color: "#7c3aed",
         fontSize: "30px",
         fontWeight: "bold",
         fontFamily: "monospace",
         textDecoration: "none",
        }}>
        FlowKet
       </Link>
      </Section>

      {/* Main Card */}
      <Section
       style={{
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        padding: "40px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        textAlign: "center",
       }}>
       {/* Header Icon */}
       <Section style={{ marginBottom: "24px" }}>
        <div
         style={{
          margin: "0 auto",
          width: "48px",
          height: "48px",
          backgroundColor: "#eef2ff",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid #e0e7ff",
         }}>
         <svg
          width="24"
          height="24"
          fill="none"
          stroke="#7c3aed"
          strokeWidth="2"
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ margin: "auto" }}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
         </svg>
        </div>
       </Section>

       <Heading
        style={{
         margin: "0 0 24px",
         color: "#111827",
         fontSize: "24px",
         fontWeight: "bold",
         lineHeight: "1.3",
        }}>
        Join {orgName}
       </Heading>

       <Text
        style={{
         margin: "0 0 32px",
         color: "#4b5563",
         fontSize: "15px",
         lineHeight: "1.6",
        }}>
        <strong>{inviterName}</strong> has invited you to join{" "}
        <strong>{orgName}</strong> as a <strong>{role}</strong>.
       </Text>

       <Section style={{ marginBottom: "24px" }}>
        <Button
         href={inviteLink}
         style={{
          backgroundColor: "#7c3aed",
          borderRadius: "5px",
          color: "#ffffff",
          fontSize: "14px",
          fontWeight: "600",
          textDecoration: "none",
          textAlign: "center",
          display: "inline-block",
          padding: "10px 20px",
          boxShadow: "0 2px 4px 0 rgba(124, 58, 237, 0.2)",
          lineHeight: "100%",
          marginRight: "10px",
         }}>
         Accept Invitation
        </Button>
       </Section>

       <Section>
        <Button
         href={`${inviteLink}&reject=true`}
         style={{
          backgroundColor: "#ffffff",
          borderRadius: "5px",
          color: "#dc2626",
          fontSize: "14px",
          fontWeight: "600",
          textDecoration: "none",
          textAlign: "center",
          display: "inline-block",
          padding: "10px 20px",
          border: "1px solid #e5e7eb",
          lineHeight: "100%",
         }}>
         Reject
        </Button>
       </Section>

       <div
        style={{
         margin: "32px 0",
         borderTop: "1px solid #f3f4f6",
        }}
       />

       <Text
        style={{
         margin: "0",
         color: "#9ca3af",
         fontSize: "14px",
         fontWeight: "500",
        }}>
        The FlowKet Team
       </Text>
      </Section>

      {/* Footer */}
      <Section style={{ textAlign: "center", marginTop: "32px" }}>
       <Text style={{ margin: "0", color: "#9ca3af", fontSize: "12px" }}>
        © {new Date().getFullYear()} FlowKet. All rights reserved.
       </Text>
      </Section>
     </Container>
    </Body>
   </Tailwind>
  </Html>
 );
};

InvitationEmail.PreviewProps = {
 id: "123",
 email: "invited@example.com",
 inviter: {
  id: "456",
  name: "Alice Johnson",
  email: "alice@example.com",
 },
 organization: {
  id: "789",
  name: "Acme Corp",
 },
 role: "member",
 inviteLink: "https://flowket.com/invite/accept/123",
} as InvitationEmailProps;

export default InvitationEmail;
