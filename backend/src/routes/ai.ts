import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// ─────────────────────────────────────────────
// POST /api/ai/chat — Google Gemini powered
// ─────────────────────────────────────────────
router.post('/chat', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const { message, language = 'en' } = req.body;

        if (!message) {
            res.status(400).json({ error: 'Message is required' });
            return;
        }

        // Fetch user's pension data for context
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { employedAt: true },
        });

        const contributions = await prisma.contribution.aggregate({
            where: { userId, type: { in: ['contribution', 'match', 'yield'] } },
            _sum: { amount: true },
            _count: true,
        });

        const balance = contributions._sum.amount || 0;
        const age = user?.age || 30;
        const yearsToRetirement = Math.max(60 - age, 0);
        const daysSinceJoin = Math.max(1, Math.ceil((Date.now() - (user?.createdAt.getTime() || Date.now())) / (1000 * 60 * 60 * 24)));
        const avgDaily = contributions._count > 0 ? balance / daysSinceJoin : 15;
        const projectedCorpus = balance + (avgDaily * 1.5 * 365 * yearsToRetirement * 1.08);
        const monthlyPension = projectedCorpus > 0 ? Math.round(projectedCorpus / (15 * 12)) : 0;

        // Get recent chat history for context
        const recentChats = await prisma.chatMessage.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 6,
        });

        // Build context-aware prompt
        const systemPrompt = `You are PensionChain AI Advisor, a friendly and knowledgeable pension advisor for informal workers in India. 

USER CONTEXT:
- Name: ${user?.name || 'User'}
- Age: ${age} years
- Current balance: ₹${Math.round(balance).toLocaleString()}
- Average daily contribution: ₹${Math.round(avgDaily)}
- Employer: ${user?.employedAt?.companyName || 'Not linked'}
- Employer match: ${user?.employedAt?.matchPercentage || 0}%
- Risk profile: ${user?.riskProfile || 'Balanced'}
- Years to retirement: ${yearsToRetirement}
- Projected corpus at 60: ₹${Math.round(projectedCorpus).toLocaleString()}
- Expected monthly pension: ₹${monthlyPension.toLocaleString()}

INSTRUCTIONS:
- Be warm, encouraging, and simple in language
- Always reference the user's actual pension data
- If asked about retirement, use their real projected amounts
- If asked in Hindi or other Indian language, respond in that language
- Keep responses concise (2-4 paragraphs max)
- Suggest actionable steps (increase contribution, etc.)
- For emergency withdrawals, explain the impact on retirement
- If they mention job switching, reassure them their pension is portable
- Use ₹ symbol for amounts
- Respond in ${language === 'hi' ? 'Hindi' : language === 'ta' ? 'Tamil' : language === 'te' ? 'Telugu' : language === 'mr' ? 'Marathi' : language === 'bn' ? 'Bengali' : 'English'}`;

        // Build conversation history
        const chatHistory = recentChats.reverse().map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
        }));

        // Call Google Gemini API
        const apiKey = process.env.GEMINI_API_KEY;
        let aiResponse: string;

        if (apiKey) {
            try {
                const { GoogleGenerativeAI } = await import('@google/generative-ai');
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

                const chat = model.startChat({
                    history: chatHistory.length > 0 ? chatHistory as any : undefined,
                    generationConfig: {
                        maxOutputTokens: 500,
                        temperature: 0.7,
                    },
                });

                const result = await chat.sendMessage(`${systemPrompt}\n\nUser message: ${message}`);
                aiResponse = result.response.text();
            } catch (aiError: any) {
                console.error('Gemini API error:', aiError.message);
                aiResponse = getFallbackResponse(message, balance, projectedCorpus, monthlyPension, yearsToRetirement, avgDaily);
            }
        } else {
            aiResponse = getFallbackResponse(message, balance, projectedCorpus, monthlyPension, yearsToRetirement, avgDaily);
        }

        // Save messages to chat history
        await prisma.chatMessage.create({
            data: { userId, role: 'user', content: message, language },
        });
        await prisma.chatMessage.create({
            data: { userId, role: 'ai', content: aiResponse, language },
        });

        res.json({
            message: aiResponse,
            context: {
                balance: Math.round(balance),
                projectedCorpus: Math.round(projectedCorpus),
                monthlyPension,
            },
        });
    } catch (error: any) {
        console.error('AI Chat error:', error);
        res.status(500).json({ error: 'AI service temporarily unavailable' });
    }
});

// ─────────────────────────────────────────────
// GET /api/ai/suggestions — Personalized tips
// ─────────────────────────────────────────────
router.get('/suggestions', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        const contributions = await prisma.contribution.aggregate({
            where: { userId, type: { in: ['contribution', 'match', 'yield'] } },
            _sum: { amount: true },
        });

        const balance = contributions._sum.amount || 0;
        const age = user?.age || 30;
        const yearsToRetirement = Math.max(60 - age, 0);

        const suggestions = [
            {
                icon: '📈',
                title: 'Increase Contribution',
                text: `Adding just ₹5 more per day could increase your retirement corpus by ₹${Math.round(5 * 365 * yearsToRetirement * 1.08 / 100000)}L!`,
            },
            {
                icon: '🏢',
                title: 'Employer Matching',
                text: user?.currentEmployerId
                    ? 'Great! Your employer is matching contributions.'
                    : 'Link an employer to get up to 50% matching on your contributions.',
            },
            {
                icon: '🎯',
                title: 'Retirement on Track',
                text: balance > 0
                    ? `Your balance of ₹${Math.round(balance).toLocaleString()} is growing! Keep contributing daily.`
                    : 'Start your first contribution today to begin building your retirement fund.',
            },
        ];

        res.json({ suggestions });
    } catch (error: any) {
        console.error('Suggestions error:', error);
        res.status(500).json({ error: 'Failed to generate suggestions' });
    }
});

// Fallback AI responses when Gemini API is unavailable
function getFallbackResponse(
    message: string,
    balance: number,
    projectedCorpus: number,
    monthlyPension: number,
    yearsToRetirement: number,
    avgDaily: number
): string {
    const msg = message.toLowerCase();

    if (msg.includes('retire') || msg.includes('pension') || msg.includes('रिटायर')) {
        return `Based on your current contribution of ₹${Math.round(avgDaily)}/day, you're projected to have approximately ₹${(projectedCorpus / 100000).toFixed(1)} Lakhs at retirement. This translates to a monthly pension of ₹${monthlyPension.toLocaleString()} for 15 years. You're on track! Would you like to explore ways to increase this amount?`;
    }

    if (msg.includes('withdraw') || msg.includes('emergency') || msg.includes('निकाल')) {
        const maxWithdraw = Math.round(balance * 0.5);
        return `You can withdraw up to ₹${maxWithdraw.toLocaleString()} (50% of your balance) for emergencies. This would reduce your monthly pension by approximately ₹${Math.round(maxWithdraw / 180).toLocaleString()}. Consider taking a loan against your pension instead — it preserves your retirement savings.`;
    }

    if (msg.includes('increase') || msg.includes('more') || msg.includes('बढ़ा')) {
        return `Great thinking! If you increase your daily contribution by ₹10 (to ₹${Math.round(avgDaily + 10)}/day), your projected corpus goes up to ₹${((projectedCorpus * 1.67) / 100000).toFixed(1)} Lakhs. That's ₹${Math.round((projectedCorpus * 0.67) / (15 * 12)).toLocaleString()} more per month in retirement!`;
    }

    if (msg.includes('job') || msg.includes('switch') || msg.includes('employer') || msg.includes('नौकरी')) {
        return `Don't worry! Your pension is fully portable with PensionChain. When you switch jobs, your accumulated balance of ₹${Math.round(balance).toLocaleString()} stays in your wallet. Just share your QR code with your new employer, and they can start contributing from day one. Zero paperwork needed!`;
    }

    if (msg.includes('invest') || msg.includes('money') || msg.includes('पैस')) {
        return `Your pension is invested in a balanced portfolio: 60% in government bonds (safe), 30% in stable yield DeFi protocols, and 10% in growth assets. This allocation is based on your Balanced risk profile and aims for ~8% annual returns. Would you like to adjust your risk profile?`;
    }

    return `Your current pension balance is ₹${Math.round(balance).toLocaleString()}, and you're ${yearsToRetirement} years from retirement. At your current rate, you're projected to receive ₹${monthlyPension.toLocaleString()}/month in retirement. How can I help you plan better? You can ask about retirement projections, emergency withdrawals, job switching, or investment strategy.`;
}

export default router;
