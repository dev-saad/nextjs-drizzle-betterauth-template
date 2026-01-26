import { cn } from "@/lib/utils";
import Image, { ImageProps } from "next/image";

interface ImgProps {
 src: string;
 alt: string;
 className?: string;
 imgClass?: string;
}

const Img = ({
 src,
 className,
 alt,
 imgClass,
 ...props
}: ImgProps & ImageProps) => {
 return (
  <div
   className={cn(
    "w-full h-full rounded-md overflow-hidden relative",
    className
   )}>
   <Image
    src={src}
    alt={alt}
    fill
    sizes="(max-width: 768px) 100vw, 50vw"
    className={cn("object-cover object-center", imgClass)}
    {...props}
   />
  </div>
 );
};

export default Img;
