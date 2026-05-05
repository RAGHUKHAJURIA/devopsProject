import authValues from "@/lib/auth"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import client from '@/db'
export async function GET() {
    const session = await getServerSession(authValues)
    if (!session || !session.user) {
        return NextResponse.json({
            msg: "Unauthorized"
        }, { status: 401 })
    }
    try {

        const response = await client.project.findMany({
            where:{
                isFeatured:true
            },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                applications: {
                    select: {
                        id: true,
                        createdAt: true,
                        applicant: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        })

        return NextResponse.json(response)
    } catch (e) {
        console.error(e)
        return NextResponse.json({
            msg: "Error occurred while fetching projects"
        }, { status: 500 })
    }
}
