// pages/api/applications/check.ts

import { NextRequest, NextResponse } from 'next/server';
import client from '@/db'; // Prisma client instance
import authValues from '@/lib/auth'; // NextAuth configuration
import { getServerSession } from 'next-auth';

// This function will handle the GET request to check if the user has applied
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  // Get the user's session
  const session = await getServerSession(authValues);

  // Check if the user is authenticated
  if (!session || !session.user) {
    return NextResponse.json({ msg: 'Unauthorized' }, { status: 401 });
  }

  try {
    const applicantId = parseInt(session.user.id);
    const projectId =parseInt(params.id);


    // Check if the user has applied for the project
    const application = await client.application.findFirst({
      where: {
        applicantId,
        projectId,
      },
    });

    if (application) {
      return NextResponse.json({ applied: true }, { status: 200 });
    } else {
      return NextResponse.json({ applied: false }, { status: 200 });
    }
  } catch (error) {
    console.error('Error checking application status:', error);
    return NextResponse.json({ msg: 'Failed to check application status', error}, { status: 500 });
  }
}
