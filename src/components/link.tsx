import { Link as RouterLink } from "react-router-dom";
import type { AnchorHTMLAttributes } from "react";

// Adapter so page code can keep using `<Link href="…">` (Next.js style) while
// rendering a React Router link under the hood.
type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string };

export default function Link({ href, children, ...rest }: Props) {
  const isExternal = /^https?:\/\//.test(href);
  if (isExternal) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <RouterLink to={href} {...rest}>
      {children}
    </RouterLink>
  );
}
