import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authValues from '@/lib/auth';
import client from '@/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authValues);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }


    // Ensure the authenticated user is requesting their own proposals
    if (session.user.id !== params.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userId = parseInt(params.id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const proposals = await client.application.findMany({
      where: {
        applicantId: userId,
      },
      include: {
        project: {
          select: {
            title: true,
            description: true,
            budget: true,
            timeExpected: true,
            skillsRequired: true,
            experienceReq: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (proposals.length === 0) {
      return NextResponse.json({
        message: 'No proposals found for this user',
        proposals: [],
      });
    }

    return NextResponse.json({
      proposals: proposals.map(proposal => ({
        id: proposal.id,
        coverLetter: proposal.coverLetter,
        createdAt: proposal.createdAt,
        status: proposal.applicationStatus,
        project: proposal.project,
      })),
    });

  } catch (error) {
    console.error('Error fetching user proposals:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}