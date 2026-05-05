import axios from "axios";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await axios.get(
      'https://pro-api.coinmarketcap.com/v1/tools/price-conversion', 
      {
        params: {
          amount: 1,
          symbol: 'SOL',
          convert: 'USD'
        },
        headers: {
          'X-CMC_PRO_API_KEY': process.env.API_KEY // Ensure this is set in your .env.local file
        }
      }
    );

    // Safely access the price from the response
    const solPrice = response.data?.data?.quote?.USD?.price;

    // Check if the price is available before returning
    if (solPrice) {
      return NextResponse.json({ price: solPrice });
    } else {
      return NextResponse.json({ error: 'Price not found' }, { status: 404 });
    }

  } catch (error) {
    console.error("Error fetching SOL price:", error);
    return NextResponse.json({ error: 'Failed to fetch SOL price' }, { status: 500 });
  }
}
