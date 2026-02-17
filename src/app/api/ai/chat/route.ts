import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { getAuthUser } from '@/lib/server-auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

export async function POST(req: NextRequest) {
    const auth = getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { message, language = 'en' } = await req.json();
        if (!message) return NextResponse.json({ error: 'Message is required' }, { status: 400 });

        const user = store.findUserById(auth.userId);
        const employer = user?.currentEmployerId ? store.findEmployerById(user.currentEmployerId) : null;
        const total = store.sumContributions(auth.userId, ['contribution', 'match', 'yield']);
        const balance = total.sum;
        const age = user?.age || 30;
        const ytr = Math.max(60 - age, 0);
        const days = Math.max(1, Math.ceil((Date.now() - (user?.createdAt.getTime() || Date.now())) / 86400000));
        const avgDaily = total.count > 0 ? balance / days : 15;
        const projectedCorpus = balance + (avgDaily * 1.5 * 365 * ytr * 1.08);
        const monthlyPension = projectedCorpus > 0 ? Math.round(projectedCorpus / 180) : 0;

        const recentChats = store.getChats(auth.userId, 6);

        const langMap: Record<string, string> = {
            hi: 'Hindi', ta: 'Tamil', te: 'Telugu', mr: 'Marathi', bn: 'Bengali', en: 'English',
        };

        const systemPrompt = `You are FinBot, an expert AI financial assistant built into the PensionChain platform. You specialize in personal finance, budgeting, investing, stock markets, mutual funds, fixed deposits, loans, retirement planning, taxes, and financial literacy for Indian users.

USER CONTEXT:
- Name: ${user?.name || 'User'}
- Age: ${age} years
- Current pension balance: ₹${Math.round(balance).toLocaleString()}
- Average daily contribution: ₹${Math.round(avgDaily)}
- Employer: ${employer?.companyName || 'Not linked'}
- Employer match: ${employer?.matchPercentage || 0}%
- Risk profile: ${user?.riskProfile || 'Balanced'}
- Years to retirement: ${ytr}
- Projected corpus at 60: ₹${Math.round(projectedCorpus).toLocaleString()}
- Expected monthly pension: ₹${monthlyPension.toLocaleString()}

INSTRUCTIONS:
- Be warm, conversational, and use simple language
- When relevant, reference the user's actual pension/financial data above
- Provide clear, accurate, practical advice on ANY financial topic
- For complex situations requiring licensed professionals, mention it briefly but still offer helpful general guidance
- Keep responses concise but thorough (2-4 paragraphs, use bullet points for lists)
- Use **bold** for key terms and numbers
- Use ₹ symbol for all Indian currency amounts
- Suggest actionable next steps
- If asked about something unrelated to finance, politely redirect to financial topics
- If asked in Hindi or other Indian language, respond in that language
- Respond in ${langMap[language] || 'English'}`;

        // Build Gemini chat history
        const chatHistory = recentChats.map(m => ({
            role: m.role === 'user' ? 'user' as const : 'model' as const,
            parts: [{ text: m.content }],
        }));

        let aiResponse: string;

        try {
            if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured');

            const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

            const chat = model.startChat({
                history: chatHistory.length > 0 ? chatHistory : undefined,
                generationConfig: {
                    maxOutputTokens: 800,
                    temperature: 0.7,
                },
            });

            const result = await chat.sendMessage(`${systemPrompt}\n\nUser message: ${message}`);
            aiResponse = result.response.text();

            if (!aiResponse) throw new Error('Empty response from Gemini');
        } catch (aiErr: any) {
            console.error('Gemini API error:', aiErr.message);
            aiResponse = getFallback(message, balance, projectedCorpus, monthlyPension, ytr, avgDaily);
        }

        store.addChat(auth.userId, 'user', message, language);
        store.addChat(auth.userId, 'ai', aiResponse, language);

        return NextResponse.json({
            message: aiResponse,
            context: { balance: Math.round(balance), projectedCorpus: Math.round(projectedCorpus), monthlyPension },
        });
    } catch (e: any) {
        console.error('AI error:', e);
        return NextResponse.json({ error: 'AI service temporarily unavailable' }, { status: 500 });
    }
}

function getFallback(msg: string, balance: number, corpus: number, pension: number, ytr: number, avg: number): string {
    const m = msg.toLowerCase();
    if (m.includes('retire') || m.includes('pension'))
        return `Based on your current contribution of ₹${Math.round(avg)}/day, you're projected to have approximately ₹${(corpus / 100000).toFixed(1)} Lakhs at retirement. This translates to a monthly pension of ₹${pension.toLocaleString()} for 15 years.`;
    if (m.includes('withdraw') || m.includes('emergency'))
        return `You can withdraw up to ₹${Math.round(balance * 0.5).toLocaleString()} (50% of your balance) for emergencies. This would reduce your monthly pension by approximately ₹${Math.round(balance * 0.5 / 180).toLocaleString()}. Consider taking a loan instead.`;
    if (m.includes('increase') || m.includes('more'))
        return `If you increase your daily contribution by ₹10 (to ₹${Math.round(avg + 10)}/day), your projected corpus goes up to ₹${((corpus * 1.67) / 100000).toFixed(1)} Lakhs!`;
    if (m.includes('job') || m.includes('switch') || m.includes('employer'))
        return `Don't worry! Your pension is fully portable with PensionChain. Your accumulated balance of ₹${Math.round(balance).toLocaleString()} stays in your wallet. Just share your QR code with your new employer.`;
    if (m.includes('invest') || m.includes('money'))
        return `Your pension is invested in a balanced portfolio: 60% government bonds, 30% stable yield DeFi, 10% growth assets. This targets ~8% annual returns based on your Balanced risk profile.`;
    return `Your current balance is ₹${Math.round(balance).toLocaleString()}, and you're ${ytr} years from retirement. At your current rate, you'll receive ₹${pension.toLocaleString()}/month. Ask me about retirement projections, withdrawals, or investment strategy!`;
}
