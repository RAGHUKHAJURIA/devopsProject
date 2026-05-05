import authValues from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import client from '@/db'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    // Verify user authentication
    const session = await getServerSession(authValues);
    if (!session || !session.user) {
        return NextResponse.json({
            msg: "Unauthorized"
        }, { status: 401 });
    }

    const id = params.id;

    try {
        // Find projects where the user is assigned
        const response = await client.project.findMany({
            where: {
                assignedId: parseInt(id)
            },
            include: {
                // Include related client details
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        // Add any other client fields you need
                    }
                },
                // Include assigned user details
                assigned: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        // Add any other user fields you need
                    }
                }
            }
        });

        return NextResponse.json(response)
    } catch (error) {
        console.error("Error fetching assigned projects:", error);
        return NextResponse.json({
            msg: "Error fetching projects",
            error: error
        }, { status: 500 });
    }
}