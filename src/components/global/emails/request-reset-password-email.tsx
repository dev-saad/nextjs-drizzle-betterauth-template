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

interface RequestResetPasswordEmailProps {
 url?: string;
}

export const RequestResetPasswordEmail = ({
 url,
}: RequestResetPasswordEmailProps) => {
 return (
  <Html>
   <Head />
   <Preview>Reset your password</Preview>
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
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
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
        Reset your password
       </Heading>

       <Text
        style={{
         margin: "0 0 32px",
         color: "#4b5563",
         fontSize: "15px",
         lineHeight: "1.6",
        }}>
        We received a request to reset the password for your FlowKet account. If
        you made this request, click the button below. If not, you can safely
        ignore this email.
       </Text>

       <Button
        href={url}
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
        }}>
        Reset Password
       </Button>

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

RequestResetPasswordEmail.PreviewProps = {
 url: "https://flowket.com/reset-password?token=123",
} as RequestResetPasswordEmailProps;

export default RequestResetPasswordEmail;
