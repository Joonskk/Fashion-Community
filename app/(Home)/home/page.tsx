import { redirect } from "next/navigation"

const Homepage = () => {
    redirect("/home/recommend");
}

export default Homepage