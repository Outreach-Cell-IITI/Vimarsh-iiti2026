import AdminPanel from "@/components/admin/AdminPanel";

export const metadata = {
  title: "Admin | Vimarsh",
  robots: { index: false, follow: false },
};

export default function AdminRoute() {
  return <AdminPanel />;
}
