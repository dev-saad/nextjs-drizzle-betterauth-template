import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AuthHeader = ({
 title,
 description,
}: {
 title: string;
 description?: string;
}) => {
 return (
  <CardHeader>
   <CardTitle className="text-xl text-center">{title}</CardTitle>
   {description && (
    <CardDescription className="text-center">{description}</CardDescription>
   )}
  </CardHeader>
 );
};

export default AuthHeader;
