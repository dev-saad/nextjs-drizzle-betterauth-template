import {
 Body,
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

interface TwoStepVerifyCodeEmailProps {
 otpCode?: string;
}

export const TwoStepVerifyCodeEmail = ({
 otpCode,
}: TwoStepVerifyCodeEmailProps) => {
 return (
  <Html>
   <Head />
   <Preview>Your two-factor authentication code</Preview>
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
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
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
        Two-factor authentication
       </Heading>

       <Text
        style={{
         margin: "0 0 32px",
         color: "#4b5563",
         fontSize: "15px",
         lineHeight: "1.6",
        }}>
        Please enter the following code to complete your login. Do not share
        this code with anyone.
       </Text>

       <Section
        style={{
         backgroundColor: "#f9fafb",
         borderRadius: "8px",
         padding: "16px",
         marginBottom: "32px",
         border: "1px solid #e5e7eb",
        }}>
        <Text
         style={{
          margin: "0",
          color: "#111827",
          fontSize: "32px",
          fontWeight: "bold",
          letterSpacing: "8px",
          fontFamily: "monospace",
         }}>
         {otpCode}
        </Text>
       </Section>

       <Text
        style={{
         margin: "32px 0 0",
         color: "#6b7280",
         fontSize: "14px",
         lineHeight: "1.5",
        }}>
        This code will expire in 10 minutes. If you didn't attempt to login,
        please secure your account immediately.
       </Text>

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

TwoStepVerifyCodeEmail.PreviewProps = {
 otpCode: "123456",
} as TwoStepVerifyCodeEmailProps;

export default TwoStepVerifyCodeEmail;
