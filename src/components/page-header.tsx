import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

function PageHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <section
      className={cn(
        "flex max-w-[980px] flex-col items-start gap-2 py-8 md:py-12",
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}

function PageHeaderHeading({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={cn(
        "text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1]",
        className
      )}
      {...props}
    />
  );
}

function PageHeaderDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("max-w-[750px] text-lg text-muted-foreground sm:text-xl", className)}
      {...props}
    />
  );
}

export { PageHeader, PageHeaderHeading, PageHeaderDescription };
