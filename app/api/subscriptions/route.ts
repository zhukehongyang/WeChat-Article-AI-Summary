import { NextResponse } from 'next/server';
import {
  getActiveSubscriptions,
  addSubscription,
  updateSubscription,
  deleteSubscription,
} from '@/lib/sqlite';

// GET - 获取所有订阅
export async function GET() {
  try {
    const subscriptions = getActiveSubscriptions();
    return NextResponse.json({
      success: true,
      subscriptions,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// POST - 添加订阅
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, rss_url, is_active = true } = body;

    if (!name || !rss_url) {
      return NextResponse.json(
        {
          success: false,
          error: 'name 和 rss_url 是必需的',
        },
        { status: 400 }
      );
    }

    const subscription = addSubscription({
      name,
      rss_url,
      is_active,
    });

    return NextResponse.json({
      success: true,
      subscription,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// DELETE - 删除订阅
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'id 参数是必需的',
        },
        { status: 400 }
      );
    }

    deleteSubscription(id);

    return NextResponse.json({
      success: true,
      message: '订阅已删除',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
