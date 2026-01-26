import { InfoIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

const InfoAlert = ({
 title,
 description,
}: {
 title: string;
 description: string;
}) => {
 return (
  <Alert variant="info">
   <InfoIcon />
   <AlertTitle>{title}</AlertTitle>
   <AlertDescription>{description}</AlertDescription>
  </Alert>
 );
};

export default InfoAlert;
