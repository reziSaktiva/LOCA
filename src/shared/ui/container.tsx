import * as React from "react"
import { cn } from "@/shared/ui/utils"

interface ContainerProps extends React.ComponentPropsWithoutRef<"div"> {
  as?: React.ElementType
}

export function Container({ as: Comp = "div", className, children, ...props }: ContainerProps) {
  return (
    <Comp className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)} {...props}>
      {children}
    </Comp>
  )
}
