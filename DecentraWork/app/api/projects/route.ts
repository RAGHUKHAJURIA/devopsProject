import client from '@/db'
import authValues from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

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
                assigned:null
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

export async function POST(req: NextRequest) {
    const session = await getServerSession(authValues)

    if (!session || !session.user) {
        return NextResponse.json(
            { msg: 'Unauthorized' },
            { status: 401 }
        )
    }

    try {
        const body = await req.json()

        if (!body.title || !body.description || !body.budget || !body.experienceReq || !Array.isArray(body.skillsRequired)) {
            return NextResponse.json(
                { msg: 'Missing required fields' },
                { status: 400 }
            )
        }

        const response = await client.project.create({

            data: {
                title: body.title,
                description: body.description,
                budget: parseInt(body.budget, 10),
                timeExpected: body.timeExpected || null,
                skillsRequired: body.skillsRequired,
                experienceReq: body.experienceReq,
                clientId: parseInt(session.user.id),
            },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        })

        return NextResponse.json(response, { status: 201 })
    } catch (error) {
        console.error('Error creating project:', error)
        return NextResponse.json(
            { msg: 'Internal Server Error' },
            { status: 500 }
        )
    }
}