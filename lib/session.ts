import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Returns the logged-in user's email, or null if nobody is logged in.
export async function getSessionEmail(): Promise<string | null> {
    const session = await getServerSession(authOptions);

    return session?.user?.email ?? null;
}