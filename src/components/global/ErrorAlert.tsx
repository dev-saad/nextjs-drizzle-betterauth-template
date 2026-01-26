import { AlertCircleIcon } from "lucide-react";
import { Alert, AlertTitle } from "../ui/alert";

const ErrorAlert = ({ message }: { message: string }) => {
 return (
  <Alert variant="destructive">
   <AlertCircleIcon />
   <AlertTitle>{message}</AlertTitle>
  </Alert>
 );
};

export default ErrorAlert;
