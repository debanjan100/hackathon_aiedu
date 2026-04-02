// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// @ts-ignore
const API_KEY = Deno.env.get('GROK_API_KEY')
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: any) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, context } = await req.json()
    
    // Fetch directly from xAI API using Grok
    const response = await fetch(`https://api.x.ai/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "grok-3-mini",
        messages: [
          { role: "system", content: context },
          { role: "user", content: message }
        ],
        temperature: 0.7
      }),
    })
    
    const data = await response.json()
    
    if (data.error) {
      throw new Error(`Grok API Error: ${data.error.message || JSON.stringify(data.error)}`);
    }

    const botReply = data.choices?.[0]?.message?.content;
    if (!botReply) {
      throw new Error(`Edge Error. Raw Grok Response: ${JSON.stringify(data)}`);
    }
    
    return new Response(JSON.stringify({ reply: botReply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })
  } catch (error: any) {
    // Return 200 so the frontend SDK reads the JSON body instead of throwing a generic "non-2xx" exception
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  }
})
