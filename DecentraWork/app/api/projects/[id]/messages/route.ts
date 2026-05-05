import { NextRequest, NextResponse } from 'next/server';
import client from '@/db';  // Assuming this is the Prisma client

export async function GET(req: NextRequest,{params}:{params:{id:string}}) {
  const id = params.id
  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  try {
    // Fetch project details, messages, client, and assigned freelancer
    const project = await client.project.findUnique({
      where: { id: Number(id) },
      include: {
        client: true, // Fetch client details
        assigned: true, // Fetch assigned freelancer details (if any)
        messages: {
          orderBy: { createdAt: 'asc' }, // Fetch messages in ascending order of creation
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const { client: projectClient, assigned: freelancer, messages } = project;

    return NextResponse.json({
      id: project.id,
      client: {
        id: projectClient.id,
        name: projectClient.name,
        email: projectClient.email,
      },
      freelancer: freelancer
        ? {
            id: freelancer.id,
            name: freelancer.name,
            email: freelancer.email,
          }
        : null,
      messages,
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching project details:', error);
    return NextResponse.json({ error: 'Error fetching project details' }, { status: 500 });
  }
}
