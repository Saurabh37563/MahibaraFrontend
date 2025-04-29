
import { redirect } from "next/navigation";
// TODO : based on session if the user session is active and valid then dont let user access the login or signup
export default async function HomePage() {

redirect('/login')
}
