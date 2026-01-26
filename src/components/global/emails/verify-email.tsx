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

interface VerifyEmailProps {
 url?: string;
}

export const VerifyEmail = ({ url }: VerifyEmailProps) => {
 return (
  <Html>
   <Head />
   <Preview>Verify your email address</Preview>
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
          borderRadius: "12px", // Slightly more rounded
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid #e0e7ff",
         }}>
         {/* Replaced SVG with a safe HTML entity checkmark because SVGs are often stripped in emails */}
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
          <path d="M20.5 15.8V8.2a1.91 1.91 0 0 0-.944-1.645l-6.612-3.8a1.88 1.88 0 0 0-1.888 0l-6.612 3.8A1.9 1.9 0 0 0 3.5 8.2v7.602a1.91 1.91 0 0 0 .944 1.644l6.612 3.8a1.88 1.88 0 0 0 1.888 0l6.612-3.8A1.9 1.9 0 0 0 20.5 15.8" />
          <path d="m8.667 12.633 1.505 1.721a1 1 0 0 0 1.564-.073L15.333 9.3" />
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
        Verify your email
       </Heading>

       <Text
        style={{
         margin: "0 0 32px",
         color: "#4b5563",
         fontSize: "15px", // Slightly refined font size
         lineHeight: "1.6",
        }}>
        Your journey with FlowKet begins here. To ensure the security and
        privacy of your account, please verify your email address.
       </Text>

       <Button
        href={url}
        style={{
         backgroundColor: "#7c3aed",
         borderRadius: "5px", // Slicker radius
         color: "#ffffff",
         fontSize: "14px", // More refined font size
         fontWeight: "600",
         textDecoration: "none",
         textAlign: "center",
         display: "inline-block",
         padding: "10px 20px", // Reduced padding for a sleeker look
         boxShadow: "0 2px 4px 0 rgba(124, 58, 237, 0.2)", // Colored shadow for "slick" feel
         lineHeight: "100%",
        }}>
        Verify Email
       </Button>

       <Text
        style={{
         margin: "32px 0 0",
         color: "#6b7280",
         fontSize: "14px",
         lineHeight: "1.5",
        }}>
        This link will expire in 24 hours. If you didn't sign up for FlowKet,
        please ignore this email.
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

VerifyEmail.PreviewProps = {
 url: "https://flowket.com/verify/123",
} as VerifyEmailProps;

export default VerifyEmail;
