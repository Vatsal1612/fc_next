// import { AdminShell } from "@/components/layout/AdminShell";

// /** Shared layout for every admin page (header + dual sidebar). */
// export default function AdminLayout({
//   children,
// }: Readonly<{ children: React.ReactNode }>) {
//   return <AdminShell>{children}</AdminShell>;
// }


import { AdminShell } from "@/components/layout/AdminShell";
import ProtectedRoute from "@/components/shared/ProtectedRoute";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <AdminShell>{children}</AdminShell>
    </ProtectedRoute>
  );
}