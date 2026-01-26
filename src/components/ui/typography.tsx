import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import React, { forwardRef, JSX } from "react";

export const typographyVariants = cva("text-foreground", {
 variants: {
  variant: {
   h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl flex items-center gap-2 [&_svg]:size-8",
   h2: "scroll-m-20 border-b py-2 text-3xl font-semibold tracking-tight first:mt-0 flex items-center gap-2 [&_svg]:size-7",
   h3: "scroll-m-20 text-2xl font-semibold tracking-tight flex items-center gap-2 [&_svg]:size-6",
   h4: "scroll-m-20 text-xl font-semibold tracking-tight flex items-center gap-2 [&_svg]:size-5",
   h5: "scroll-m-20 text-lg font-semibold tracking-tight flex items-center gap-2 [&_svg]:size-5",
   h6: "scroll-m-20 text-base font-semibold tracking-tight flex items-center gap-2 [&_svg]:size-4",
   p: "leading-7",
   lead: "text-xl text-muted-foreground",
   large: "text-lg font-semibold",
   small: "text-sm font-medium leading-none",
   muted: "text-sm text-muted-foreground",
   inlineCode:
    "relative rounded-sm bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
   multilineCode:
    "relative rounded-sm bg-muted p-4 font-mono text-sm font-semibold overflow-x-auto",
   list: "my-6 ml-6 list-disc [&>li]:mt-2",
   quote: "mt-6 border-l-2 pl-6 italic text-muted-foreground",
  },
 },
 defaultVariants: {
  variant: "p",
 },
});

type VariantPropType = VariantProps<typeof typographyVariants>;

const variantElementMap: Record<
 NonNullable<VariantPropType["variant"]>,
 keyof JSX.IntrinsicElements
> = {
 h1: "h1",
 h2: "h2",
 h3: "h3",
 h4: "h4",
 h5: "h5",
 h6: "h6",
 p: "p",
 lead: "p",
 large: "div",
 small: "small",
 muted: "span",
 inlineCode: "code",
 multilineCode: "pre",
 list: "ul",
 quote: "blockquote",
};

export interface TypographyProps
 extends
  React.HTMLAttributes<HTMLElement>,
  VariantProps<typeof typographyVariants> {
 as?: keyof JSX.IntrinsicElements;
}

const Typography = forwardRef<HTMLElement, TypographyProps>(
 ({ className, variant = "p", as, ...props }, ref) => {
  const Tag = (as ??
   variantElementMap[variant || "p"] ??
   "p") as React.ElementType;
  return (
   <Tag
    className={cn(typographyVariants({ variant, className }))}
    ref={ref}
    {...props}
   />
  );
 },
);

Typography.displayName = "Typography";

export { Typography };

// Backward compatibility wrappers
export const H1 = forwardRef<
 HTMLHeadingElement,
 React.HTMLAttributes<HTMLHeadingElement>
>((props, ref) => <Typography variant="h1" as="h1" ref={ref} {...props} />);
H1.displayName = "H1";

export const H2 = forwardRef<
 HTMLHeadingElement,
 React.HTMLAttributes<HTMLHeadingElement>
>((props, ref) => <Typography variant="h2" as="h2" ref={ref} {...props} />);
H2.displayName = "H2";

export const H3 = forwardRef<
 HTMLHeadingElement,
 React.HTMLAttributes<HTMLHeadingElement>
>((props, ref) => <Typography variant="h3" as="h3" ref={ref} {...props} />);
H3.displayName = "H3";

export const H4 = forwardRef<
 HTMLHeadingElement,
 React.HTMLAttributes<HTMLHeadingElement>
>((props, ref) => <Typography variant="h4" as="h4" ref={ref} {...props} />);
H4.displayName = "H4";

export const P = forwardRef<
 HTMLParagraphElement,
 React.HTMLAttributes<HTMLParagraphElement>
>((props, ref) => <Typography variant="p" as="p" ref={ref} {...props} />);
P.displayName = "P";

export const Lead = forwardRef<
 HTMLParagraphElement,
 React.HTMLAttributes<HTMLParagraphElement>
>((props, ref) => <Typography variant="lead" as="p" ref={ref} {...props} />);
Lead.displayName = "Lead";

export const Large = forwardRef<
 HTMLDivElement,
 React.HTMLAttributes<HTMLDivElement>
>((props, ref) => <Typography variant="large" as="div" ref={ref} {...props} />);
Large.displayName = "Large";

export const Small = forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
 (props, ref) => <Typography variant="small" as="small" ref={ref} {...props} />,
);
Small.displayName = "Small";

export const Muted = forwardRef<
 HTMLSpanElement,
 React.HTMLAttributes<HTMLSpanElement>
>((props, ref) => (
 <Typography variant="muted" as="span" ref={ref} {...props} />
));
Muted.displayName = "Muted";

export const InlineCode = forwardRef<
 HTMLElement,
 React.HTMLAttributes<HTMLElement>
>((props, ref) => (
 <Typography variant="inlineCode" as="code" ref={ref} {...props} />
));
InlineCode.displayName = "InlineCode";

export const MultilineCode = forwardRef<
 HTMLPreElement,
 React.HTMLAttributes<HTMLPreElement>
>((props, ref) => (
 <Typography variant="multilineCode" as="pre" ref={ref} {...props} />
));
MultilineCode.displayName = "MultilineCode";

export const List = forwardRef<
 HTMLUListElement,
 React.HTMLAttributes<HTMLUListElement>
>((props, ref) => <Typography variant="list" as="ul" ref={ref} {...props} />);
List.displayName = "List";

export const Quote = forwardRef<
 HTMLQuoteElement,
 React.HTMLAttributes<HTMLQuoteElement>
>((props, ref) => (
 <Typography variant="quote" as="blockquote" ref={ref} {...props} />
));
Quote.displayName = "Quote";
