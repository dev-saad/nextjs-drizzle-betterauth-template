import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";

export default function GeneralSettingsLoading() {
 return (
  <FieldGroup>
   {/* Organization Identity Card */}
   <Card>
    <CardHeader>
     <Skeleton className="h-6 w-48 mb-2" />
     <Skeleton className="h-4 w-72" />
    </CardHeader>
    <CardContent>
     <div className="flex flex-col sm:flex-row items-center gap-5">
      <Skeleton className="h-32 w-32 rounded-full shrink-0" />
      <FieldGroup>
       <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
       </div>
       <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
       </div>
      </FieldGroup>
     </div>
    </CardContent>
   </Card>

   {/* Business Details Card */}
   <Card>
    <CardHeader>
     <Skeleton className="h-6 w-48 mb-2" />
     <Skeleton className="h-4 w-72" />
    </CardHeader>
    <CardContent>
     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
       <div key={i} className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
       </div>
      ))}
     </div>
    </CardContent>
   </Card>

   {/* Regional & Standards Card */}
   <Card>
    <CardHeader>
     <Skeleton className="h-6 w-48 mb-2" />
     <Skeleton className="h-4 w-72" />
    </CardHeader>
    <CardContent>
     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
       <div key={i} className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
       </div>
      ))}
     </div>
    </CardContent>
   </Card>

   {/* Business Address Card */}
   <Card>
    <CardHeader>
     <Skeleton className="h-6 w-48 mb-2" />
     <Skeleton className="h-4 w-72" />
    </CardHeader>
    <CardContent>
     <FieldGroup>
      <div className="space-y-2">
       <Skeleton className="h-4 w-32" />
       <Skeleton className="h-10 w-full" />
      </div>
      <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
       <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
       </div>
       <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
       </div>
      </div>
      <div className="grid sm:grid-cols-3 grid-cols-1 gap-4">
       {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-2">
         <Skeleton className="h-4 w-32" />
         <Skeleton className="h-10 w-full" />
        </div>
       ))}
      </div>
     </FieldGroup>
    </CardContent>
   </Card>
  </FieldGroup>
 );
}
