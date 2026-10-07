import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "ghost"
  | "danger";

export type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-60";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-ink text-white hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-16px_rgba(17,17,17,0.75)]",
  secondary:
    "border border-line-strong bg-surface text-ink hover:border-ink hover:bg-surface-muted",
  accent:
    "bg-accent text-white hover:bg-accent-deep hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-16px_rgba(37,99,235,0.7)]",
  ghost: "text-ink-soft hover:bg-surface-muted hover:text-ink",
  danger: "bg-danger text-white hover:brightness-95",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-7 text-[0.95rem]",
};

export function buttonClassName(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className = "",
): string {
  return `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`.trim();
}

interface StyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
}

type ButtonProps = StyleProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClassName(variant, size, `${fullWidth ? "w-full" : ""} ${className}`)}
      {...rest}
    >
      {children}
    </button>
  );
}

type ButtonLinkProps = StyleProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children"> & {
    href: string;
  };

export function ButtonLink({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  children,
  href,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={buttonClassName(variant, size, `${fullWidth ? "w-full" : ""} ${className}`)}
      {...rest}
    >
      {children}
    </Link>
  );
}
