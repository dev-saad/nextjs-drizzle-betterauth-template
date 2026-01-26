import { Tailwind } from "@react-email/components";
import { ReactNode } from "react";

const TailwindWrapper = ({ children }: { children: ReactNode }) => {
 return (
  <Tailwind
   config={{
    theme: {
     extend: {
      colors: {
       primary: "#7c3aed", // FlowKet Primary
       secondary: "#a8a29e",
       background: "#f3f4f6",
      },
     },
    },
   }}>
   {children}
  </Tailwind>
 );
};

export default TailwindWrapper;
