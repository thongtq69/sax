import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const popupAd = await prisma.popupAd.findUnique({
            where: { id: params.id },
        })

        if (!popupAd) {
            return NextResponse.json({ error: 'Popup ad not found' }, { status: 404 })
        }

        return NextResponse.json(popupAd)
    } catch (error) {
        console.error('Error fetching popup ad:', error)
        return NextResponse.json({ error: 'Failed to fetch popup ad' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const body = await request.json()
        const { title, description, image, ctaText, ctaLink, isActive, isHtml, htmlContent } = body

        const popupAd = await prisma.popupAd.update({
            where: { id: params.id },
            data: {
                title,
                description: description !== undefined ? description : undefined,
                image: image !== undefined ? image : undefined,
                ctaText: ctaText !== undefined ? ctaText : undefined,
                ctaLink: ctaLink !== undefined ? ctaLink : undefined,
                isHtml: isHtml !== undefined ? isHtml : undefined,
                htmlContent: htmlContent !== undefined ? htmlContent : undefined,
                isActive: isActive !== undefined ? isActive : undefined,
            },
        })

        return NextResponse.json(popupAd)
    } catch (error) {
        console.error('Error updating popup ad:', error)
        return NextResponse.json({ error: 'Failed to update popup ad' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        await prisma.popupAd.delete({
            where: { id: params.id },
        })

        return NextResponse.json({ message: 'Popup ad deleted successfully' })
    } catch (error) {
        console.error('Error deleting popup ad:', error)
        return NextResponse.json({ error: 'Failed to delete popup ad' }, { status: 500 })
    }
}
