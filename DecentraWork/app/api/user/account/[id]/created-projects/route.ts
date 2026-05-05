import authValues from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import client from '@/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authValues);
    
    if (!session || !session.user) {
        return NextResponse.json({
            msg: "Unauthorized"
        }, { status: 401 });
    }
    
    try {
        const clientId = params.id;

        // Check if the session user is allowed to view this user's projects
        if (session.user.id !== (clientId)) {
            return NextResponse.json({
                msg: "Forbidden"
            }, { status: 403 });
        }

        // Fetch projects created by this user and where a freelancer is assigned
        const createdProjects = await client.project.findMany({
            where: {
                clientId: parseInt(clientId),
            },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                assigned: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        // Return the created projects
        return NextResponse.json(createdProjects);
    } catch (error) {
        console.error(error);
        return NextResponse.json({
            msg: "Something went wrong"
        }, { status: 500 });
    }
}