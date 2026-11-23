/*import {headers} from "next/headers";
import { redirect } from "next/navigation";
import { auth, Auth } from "@/lib/auth";
import {prisma} from "@/lib/prisma";

export async function adminRequire{
    const session = await auth.api.getSession({headers: await headers()})
    if(!session) {
        //cambiar cuando haya login 
        redirect("/");
    }

    const admin = await prisma..findFirst({
        where: {}
    })



}
*/