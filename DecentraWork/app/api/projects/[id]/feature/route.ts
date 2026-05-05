import authValues from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import client from '@/db';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authValues);
  
  // Check if the user is authenticated
  if (!session || !session.user) {
    return NextResponse.json({
      msg: "Unauthorized"
    }, { status: 401 });
  }
  
  try {
    const projectId = parseInt(params.id);

    // Validate project ID
    if (isNaN(projectId)) {
      return NextResponse.json({
        msg: "Invalid project ID"
      }, { status: 400 });
    }

    // Update the project to set isFeatured to true
    const response = await client.project.update({
      where: {
        id: projectId
      },
      data: {
        isFeatured: true, // Changed semicolon to comma
      }
    });

    // Return success response
    return NextResponse.json({
      msg: "Project featured successfully",
      project: response
    }, { status: 200 });

  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({
      msg: 'Failed to update project',
    }, { status: 500 });
  }
}
