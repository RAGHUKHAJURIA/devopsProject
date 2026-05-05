import authValues from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import client from '@/db'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authValues);

  if (!session || !session.user) {
    return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
  }

  try {
    const projectId = parseInt(params.id, 10);
    
    if (isNaN(projectId)) {
      return NextResponse.json({ msg: "Invalid project ID" }, { status: 400 });
    }

    await client.project.update({
      where: { id: projectId },
      data: { isCompleted: true },
    });

    return NextResponse.json({ msg: "The project is marked completed" }, { status: 200 });

  } catch (error) {
    console.error("Error updating project status:", error);
    return NextResponse.json({ msg: "Error occurred while updating the project" }, { status: 500 });
  }
}
