// pages/api/projects/[id]/applications.ts

import authValues from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import client from '@/db';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authValues);
  
  // Check if the user is authenticated
  if (!session || !session.user) {
    return NextResponse.json({
      msg: "Unauthorized"
    }, { status: 401 });
  }

  const projectId = parseInt(params.id, 10); // Make sure to parse the projectId correctly
  
  try {
    // Fetch the project to check if the current user is the creator
    const project = await client.project.findUnique({
      where: { id: projectId },
      select: {
        clientId: true // Get the client's user ID
      }
    });

    // Check if the project exists and if the user is the creator
    if (!project || project.clientId !== parseInt(session.user.id)) {
      return NextResponse.json({
        msg: "Forbidden: You are not the owner of this project."
      }, { status: 403 });
    }

    // Fetch all applications for the project
    const applications = await client.application.findMany({
      where: {
        projectId: projectId
      },
      include: {
        applicant: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return NextResponse.json(applications, { status: 200 });

  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({
      msg: 'Failed to fetch applications',
      error
    }, { status: 500 });
  }
}
