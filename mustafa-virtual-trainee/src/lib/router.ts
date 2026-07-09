import { useNavigate, useLocation, useParams as useRouterParams } from "react-router-dom";

// Compatibility shims mapping the Next.js navigation API onto React Router, so
// page code can keep the same call sites after the migration to Vite.

export function useRouter() {
  const navigate = useNavigate();
  return {
    push: (path: string) => navigate(path),
    replace: (path: string) => navigate(path, { replace: true }),
    back: () => navigate(-1),
  };
}

export function usePathname(): string {
  return useLocation().pathname;
}

export const useParams = useRouterParams;
