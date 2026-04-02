const key = process.env.OPENROUTER_API_KEY || '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';

fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + key,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'google/gemma-3-12b-it:free',
    messages: [{role:'user', content:'Hi! Answer very briefly.'}]
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
