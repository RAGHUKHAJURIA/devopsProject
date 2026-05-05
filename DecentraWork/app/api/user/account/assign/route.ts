import authValues from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import client from '@/db';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authValues);
    if (!session || !session.user) {
        return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
    }

    const { applicantId, id: projectId } = await req.json();

    // Basic validation
    if (!applicantId || !projectId || isNaN(Number(applicantId)) || isNaN(Number(projectId))) {
        return NextResponse.json({ msg: "Invalid applicantId or projectId" }, { status: 400 });
    }

    try {
        // Find the application for the given applicantId and projectId
        const application = await client.application.findFirst({
            where: {
                applicantId: Number(applicantId),
                projectId: Number(projectId),
            },
        });

        if (!application) {
            return NextResponse.json({ msg: "Application not found" }, { status: 404 });
        }

        // Use a transaction to ensure atomicity
        await client.$transaction(async (prisma) => {
            // Update the application status to accepted
            await prisma.application.update({
                where: { id: application.id },
                data: { applicationStatus: 'accepted' },
            });

            // Reject all other applications for this project
            await prisma.application.updateMany({
                where: {
                    projectId: Number(projectId),
                    NOT: {
                        id: application.id,
                    },
                },
                data: { applicationStatus: 'rejected' },
            });

            // Assign the freelancer to the project
            await prisma.project.update({
                where: { id: Number(projectId) },
                data: {
                    assignedId: Number(applicantId),
                },
            });
        });

        return NextResponse.json({ msg: "Freelancer assigned successfully" }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ msg: "Error assigning freelancer" }, { status: 500 });
    }
}


export async function GET(req: NextRequest) {
    const session = await getServerSession(authValues);
    if (!session || !session.user) {
        return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const applicantId = searchParams.get('applicantId');
    
    // Basic validation
    if (!applicantId || isNaN(Number(applicantId))) {
        return NextResponse.json({ msg: "Invalid applicantId" }, { status: 400 });
    }

    try {
        const freelancer = await client.user.findUnique({
            where: {
                id: Number(applicantId),
            },
            select: {
                id: true,
                name: true,
                email: true,
            },
        });

        if (!freelancer) {
            return NextResponse.json({ msg: "Freelancer not found" }, { status: 404 });
        }

        return NextResponse.json(freelancer, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ msg: "Error fetching freelancer details" }, { status: 500 });
    }
}