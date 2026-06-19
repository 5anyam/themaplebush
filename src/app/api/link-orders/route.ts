import { NextRequest, NextResponse } from 'next/server';

const WC_CONFIG = {
  BASE_URL: 'https://cms.kdbookbazaar.com',
  KEY: process.env.CONSUMER_KEY || 'ck_b2cff698fa447d779aa56d980ea00fea049721a7',
  SECRET: process.env.CONSUMER_SECRET || 'cs_1f8a7857e2e4030a0a8222979673ef040c763848',
};

// ✅ Define proper types
interface WooCommerceOrder {
  id: number;
  customer_id: number;
  billing: {
    email: string;
    first_name: string;
    last_name: string;
  };
}

interface LinkOrdersRequest {
  email: string;
  customerId: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as LinkOrdersRequest;
    const { email, customerId } = body;

    // Fetch all orders with this email
    const auth = btoa(`${WC_CONFIG.KEY}:${WC_CONFIG.SECRET}`);
    const ordersResponse = await fetch(
      `${WC_CONFIG.BASE_URL}/wp-json/wc/v3/orders?per_page=100`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    const allOrders = await ordersResponse.json() as WooCommerceOrder[];
    
    // Filter by email and customer_id = 0 (guest orders)
    const guestOrders = allOrders.filter(
      (order: WooCommerceOrder) => 
        order.billing.email.toLowerCase() === email.toLowerCase() &&
        order.customer_id === 0
    );

    console.log(`Found ${guestOrders.length} guest orders to link`);

    // Update each order with customer_id
    const updatePromises = guestOrders.map(async (order: WooCommerceOrder) => {
      const updateResponse = await fetch(
        `${WC_CONFIG.BASE_URL}/wp-json/wc/v3/orders/${order.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${auth}`,
          },
          body: JSON.stringify({
            customer_id: customerId,
          }),
        }
      );
      return updateResponse.json();
    });

    const results = await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      linked: results.length,
      message: `${results.length} orders linked to customer`,
    });
  } catch (error) {
    console.error('Error linking orders:', error);
    return NextResponse.json(
      { error: 'Failed to link orders' },
      { status: 500 }
    );
  }
}
