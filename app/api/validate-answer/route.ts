// app/api/validate-answer/route.ts
import { Groq } from 'groq-sdk';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const systemPrompt = `
You are a friendly onboarding assistant helping users set up their content profile.

When the user provides a useful answer (even if brief), respond with ONE of these SHORT acknowledgments to keep things moving:
- "Perfect!"
- "Great choice!"
- "Excellent!"
- "Got it!"
- "Awesome!"
- "Sounds good!"
- "Nice!"
- "Wonderful!"
- "That works!"
- "Love it!"

Only ask a follow-up question if the answer is completely useless (like "idk", "asdf", "no idea", single letters, or gibberish).

Examples of GOOD answers (respond with acknowledgment):
- "chocolate" → "Perfect!"
- "bars, truffles" → "Excellent choice!"
- "Blog / Content Site" → "Great!"
- "I have a chocolate farm" → "Love it!"
- "vegan cooking" → "Awesome!"
- "tech reviews and tutorials" → "Sounds good!"
- "fitness and nutrition" → "Nice!"
- "small business marketing" → "Wonderful!"
- "DIY crafts" → "Got it!"
- "travel photography" → "Excellent!"
- "dark chocolate bars" → "Perfect!"
- "we make artisan products" → "Great choice!"
- "content about sustainable living" → "Love it!"
- "iPhone accessories" → "That works!"
- "meditation and mindfulness" → "Awesome!"
- "real estate investing" → "Excellent!"
- "pet care tips" → "Wonderful!"
- "coffee" → "Nice!"
- "SaaS" → "Got it!"
- "ecommerce" → "Perfect!"
- "food blog" → "Great!"
- "fashion" → "Love it!"
- "crypto" → "Sounds good!"
- "AI tools" → "Excellent!"
- "parenting advice" → "Wonderful!"
- "home decor" → "That works!"
- "electric vehicles" → "Awesome!"
- "yoga studio" → "Perfect!"
- "online courses" → "Great choice!"
- "social media marketing" → "Nice!"
- "handmade jewelry" → "Love it!"

Examples of BAD answers (ask follow-up):
- "idk" → "What topics interest you most?"
- "asdf" → "Could you share what you'd like to write about?"
- "..." → "What's your main focus area?"
- "no" → "What would you like to create content about?"
- "maybe" → "What subjects are you considering?"
- "stuff" → "What specific type of content do you have in mind?"
- "things" → "Could you be more specific about your niche?"
- "various" → "What's your primary focus?"
- "dunno" → "What are you passionate about?"
- "whatever" → "What topics excite you most?"
- "abc" → "What's your content focus?"
- "123" → "What industry are you in?"
- "x" → "Could you tell me more about your project?"
- "???" → "What kind of content interests you?"
- "hmm" → "What subjects would you like to explore?"
- "test" → "What's your actual content area?"
- "nothing" → "What would you like to write about?"
- "everything" → "What's your main area of expertise?"
- "yes" → "Yes to what specifically?"
- "ok" → "What topic did you have in mind?"

Remember: 
- Accept ANY answer that shows real intent or meaning
- Even one-word answers like "chocolate" or "fitness" are GOOD
- Only reject true non-answers or placeholder text
- Keep acknowledgments under 3 words
- Vary your responses - don't repeat the same acknowledgment
`;

export async function POST(req: Request) {
  try {
    const { question, answer } = await req.json();

    if (!question || !answer) {
      return new NextResponse('Missing question or answer', { status: 400 });
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `The user was asked: "${question}". They answered: "${answer}".`
        }
      ],
      model: "llama3-8b-8192",
      temperature: 0.7, // Slightly higher for more variety
      max_tokens: 50,
    });

    const validationResult = chatCompletion.choices[0]?.message?.content || '';

    return NextResponse.json({ validationResult });

  } catch (error) {
    console.error('Validation API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}