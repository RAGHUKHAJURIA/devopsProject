import authValues from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import client from '@/db'


export async function PUT(req:NextRequest,{params}:{params:{id:string}}){
  const session = await getServerSession(authValues);
  
  // Check if the user is authenticated
  if (!session || !session.user) {
    return NextResponse.json({
      msg: "Unauthorized"
    }, { status: 401 });
  }
  try{
    const id = params.id;
    const body = await req.json();
    await client.project.update({
      where:{
        id:parseInt(id)
      },
      data:{
        clientCompletionMessage:body.completionMessage
      }
    })
    return NextResponse.json({
      msg:"Client message updated successfully"
    })
  }catch(e){
    console.error(e);
    return NextResponse.json({
      msg:"Error occurred while updating"
    })
  }
}