import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Razorpay from "npm:razorpay"
import crypto from "node:crypto"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { action } = body

    // 1. Generate Order securely on the server
    if (action === 'create-order') {
      const instance = new Razorpay({
        key_id: Deno.env.get('RAZORPAY_KEY') || 'rzp_test_mock',
        key_secret: Deno.env.get('RAZORPAY_SECRET') || 'mock_secret',
      });
      const order = await instance.orders.create({ amount: 49900, currency: "INR", receipt: "receipt_aiedu" });
      return new Response(JSON.stringify(order), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // 2. Cryptographically verify signature
    if (action === 'verify-payment') {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
      
      const shasum = crypto.createHmac("sha256", Deno.env.get('RAZORPAY_SECRET') || 'mock_secret');
      shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const digest = shasum.digest("hex");

      if (digest === razorpay_signature) {
          // Verified authenticity. Frontend allowed to bump isPremium.
          return new Response(JSON.stringify({ success: true, message: "Payment rigorously verified." }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      } else {
          // If the user attempts to forge a payment, throw generic error.
          throw new Error("Invalid signature verification block.");
      }
    }
    
    throw new Error('Unknown payment route instruction');
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
