import { redirect } from "next/navigation";

/** Root redirects to the default page (matches index.html's initial iframe src). */
export default function Home() {
  redirect("/setup/my-profile");
}
