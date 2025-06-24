import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type ClerkWebhookEvent = {
    type: string
    data: {
        id: string
        email_addresses: Array<{
            email_address: string
            verification?: {
                status: string
            }
        }>
        first_name?: string
        last_name?: string
        image_url?: string
        created_at?: number
        updated_at?: number
    }
}

export async function POST(req: NextRequest) {
    try {
        // Webhook署名を検証するための環境変数の確認
        const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

        if (!WEBHOOK_SECRET) {
            console.error('CLERK_WEBHOOK_SECRET environment variable is missing')
            return NextResponse.json(
                { error: 'Webhook secret not configured' },
                { status: 500 }
            )
        }

        // Webhookのヘッダーを取得
        const headerPayload = await headers()
        const svix_id = headerPayload.get('svix-id')
        const svix_timestamp = headerPayload.get('svix-timestamp')
        const svix_signature = headerPayload.get('svix-signature')

        // 必要なヘッダーが存在するかチェック
        if (!svix_id || !svix_timestamp || !svix_signature) {
            console.error('Missing required Svix headers')
            return NextResponse.json(
                { error: 'Missing required headers' },
                { status: 400 }
            )
        }

        // リクエストボディを取得
        const payload = await req.text()

        // Webhook署名を検証
        const wh = new Webhook(WEBHOOK_SECRET)
        let evt: ClerkWebhookEvent

        try {
            evt = wh.verify(payload, {
                'svix-id': svix_id,
                'svix-timestamp': svix_timestamp,
                'svix-signature': svix_signature,
            }) as ClerkWebhookEvent
        } catch (err) {
            console.error('Error verifying webhook:', err)
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 400 }
            )
        }

        // イベントタイプに応じた処理
        const { type, data } = evt

        switch (type) {
            case 'user.created':
                await handleUserCreated(data)
                break
            case 'user.updated':
                await handleUserUpdated(data)
                break
            case 'user.deleted':
                await handleUserDeleted(data)
                break
            default:
                console.log(`Unhandled event type: ${type}`)
        }

        return NextResponse.json({ success: true }, { status: 200 })
    } catch (error) {
        console.error('Webhook error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// ユーザー作成時の処理
async function handleUserCreated(data: ClerkWebhookEvent['data']) {
    try {
        const primaryEmail = data.email_addresses.find(
            email => email.verification?.status === 'verified'
        ) || data.email_addresses[0]

        if (!primaryEmail) {
            console.error('No email address found for user')
            return
        }

        const user = await prisma.user.create({
            data: {
                id: data.id,
                email: primaryEmail.email_address,
                firstName: data.first_name || null,
                lastName: data.last_name || null,
                imageUrl: data.image_url || null,
            },
        })

        console.log(`User created in database: ${user.id} (${user.email})`)
    } catch (error) {
        console.error('Error creating user:', error)
        // ユーザーが既に存在する場合は無視
        if (error instanceof Error && error.message.includes('Unique constraint')) {
            console.log(`User ${data.id} already exists in database`)
        } else {
            throw error
        }
    }
}

// ユーザー更新時の処理
async function handleUserUpdated(data: ClerkWebhookEvent['data']) {
    try {
        const primaryEmail = data.email_addresses.find(
            email => email.verification?.status === 'verified'
        ) || data.email_addresses[0]

        if (!primaryEmail) {
            console.error('No email address found for user')
            return
        }

        const user = await prisma.user.update({
            where: { id: data.id },
            data: {
                email: primaryEmail.email_address,
                firstName: data.first_name || null,
                lastName: data.last_name || null,
                imageUrl: data.image_url || null,
            },
        })

        console.log(`User updated in database: ${user.id} (${user.email})`)
    } catch (error) {
        console.error('Error updating user:', error)
        throw error
    }
}

// ユーザー削除時の処理
async function handleUserDeleted(data: ClerkWebhookEvent['data']) {
    try {
        await prisma.user.delete({
            where: { id: data.id },
        })

        console.log(`User deleted from database: ${data.id}`)
    } catch (error) {
        console.error('Error deleting user:', error)
        // ユーザーが存在しない場合は無視
        if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
            console.log(`User ${data.id} not found in database`)
        } else {
            throw error
        }
    }
} 