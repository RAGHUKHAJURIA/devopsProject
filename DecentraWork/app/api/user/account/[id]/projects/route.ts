import authValues from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import client from '@/db';
import { NextRequest } from 'next/server';

export  async function GET(request: NextRequest,{params}:{params:{id:string}}) {
    const session = await getServerSession(authValues);
    
    // Check if the user is authenticated
    if (!session || !session.user) {
        return NextResponse.json({
            msg: "Unauthorized"
        }, { status: 401 });
    }

    // Extract user ID from the request URL
    const id = params.id;

    try {
        // Fetch the projects created by the user
        const projects = await client.user.findMany({
            where: {
                id: parseInt(id), // Assuming the relation is set with id
            },
        });

        // Return the fetched projects
        return NextResponse.json(projects);
    } catch (error) {
        console.error(error);
        return NextResponse.json({
            msg: "Error occurred while fetching projects"
        }, { status: 500 });
    }
}
