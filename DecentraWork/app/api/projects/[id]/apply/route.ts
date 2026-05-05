import { NextRequest, NextResponse } from 'next/server';
import client from '@/db'; // Your Prisma client instance
import authValues from '@/lib/auth'; // Your NextAuth configuration
import { getServerSession } from 'next-auth';

// This function will handle the POST request for submitting an application
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  // Get the user's session
  const session = await getServerSession(authValues);
  
  // Check if the user is authenticated
  if (!session || !session.user) {
    return NextResponse.json({
      msg: 'Unauthorized',
    }, { status: 401 });
  }

  // Parse the request body
  const body = await req.json();

  try {
    // Extract the project ID from the route params
    const projectId = parseInt(params.id, 10);
    
    if (isNaN(projectId)) {
      return NextResponse.json({
        msg: 'Invalid project ID',
      }, { status: 400 });
    }

    // Create the application entry in the database
    const response = await client.application.create({
      data: {
        coverLetter: body.coverLetter,
        projectId: projectId,
        applicantId: parseInt(session.user.id), // Use the user ID from the session
      },
    });

    // Return a successful response
    return NextResponse.json({
      msg: 'Application submitted successfully',
      application: response,
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    return NextResponse.json({
      msg: 'Failed to submit application',
    }, { status: 500 });
  }
}
