import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const session = await auth();
  
  if (session?.user) {
    redirect("/intake");
  }
  
  redirect("/login");
}
