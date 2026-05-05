import { NextRequest, NextResponse } from "next/server";
import client from '@/db';
import { getServerSession } from "next-auth";
import authValues from "@/lib/auth";


export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authValues);
  
  // Check for unauthorized access
  if (!session || !session.user) {
    return NextResponse.json({ msg: "Unauthorized" });
  }
  const userId = params.id

  try {

    
    // Fetch the user details and their projects from the database using Prisma
    const user = await client.user.findUnique({
      where: {
        id: parseInt(userId),
      },
      select: {
        id: true,
        name: true,
        email: true,
        experience: true,
        skills: true,
        bio: true,
        walletAddressETH: true,
        walletAddressSOL: true,
        projectsCreated: {
          select: {
            id: true,
            title: true,
            description: true,
            budget: true,
            timeExpected: true,
            experienceReq: true,
            skillsRequired: true,
            client: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      }, // Select specific fields to return (excluding sensitive data like password)
    });

    if (!user) {
      return NextResponse.json({ msg: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ msg: 'Error fetching user details' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authValues);
  if (!session || !session.user) {
    return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const userId = parseInt(session.user.id);

  // Ensure the user is updating their own profile
  if (session.user.id !== userId.toString()) {
    return NextResponse.json({ msg: "Forbidden" }, { status: 403 });
  }

  try {
    const response = await client.user.update({
      where: { id: userId },
      data: {
        name: body.name,
        bio: body.bio,
        experience: body.experience,
        skills: body.skills,
        walletAddressETH:body.walletAddressETH,
        walletAddressSOL:body.walletAddressSOL
        // Add any other fields that can be updated
      }
    });

    return NextResponse.json(response);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ msg: "Error occurred while updating information" }, { status: 500 });
  }
}