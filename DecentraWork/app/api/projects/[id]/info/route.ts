import { NextRequest, NextResponse } from 'next/server';
import client from '@/db'; // Prisma client instance
import authValues from '@/lib/auth'; // NextAuth configuration
import { getServerSession } from 'next-auth';

// This function will handle the GET request to fetch project info
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get the user's session
    const session = await getServerSession (authValues);

    // Check if the user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { msg: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Extract the project ID from the route params
    const projectId = parseInt(params.id, 10);

    // Validate that the project ID is a valid number
    if (isNaN(projectId)) {
      return NextResponse.json(
        { msg: 'Invalid project ID' },
        { status: 400 }
      );
    }

    // Fetch the project info from the database including the client details
    const project = await client.project.findUnique({
      where: {
        id: projectId,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true, // You can include other client-related fields as needed
          },
        },
      },
    });


    // If project not found, return a 404 error
    if (!project) {
      return NextResponse.json(
        { project : {}}
      );
    }

    // Return the project info along with client details
    return NextResponse.json({
      project:{
        id: project.id,
        title: project.title,
        description: project.description,
        budget: project.budget,
        timeExpected: project.timeExpected,
        experienceReq: project.experienceReq,
        skillsRequired: project.skillsRequired,
        client: project.client, // Include the client details in the response
        
      },
    });

  } catch (error) {
    console.error('Error fetching project info:', error);
    return NextResponse.json(
      { msg: 'Failed to fetch project info' },
      { status: 500 }
    );
  }
}
