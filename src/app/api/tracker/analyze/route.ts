import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// ─── POST /api/tracker/analyze — تحليل Gemini AI ───
export async function POST(request: NextRequest) {
  try {
    const { journalText, moodScore, recentLogs } = await request.json();

    if (!journalText && !moodScore) {
      return NextResponse.json({ error: 'البيانات مطلوبة' }, { status: 400 });
    }

    const geminiKey = process.env.GEMINI_API_KEY;

    if (!geminiKey) {
      // Mock analysis لو مفيش Gemini API Key
      const mockAnalysis = {
        sentiment: moodScore >= 7 ? 'positive' : moodScore >= 4 ? 'neutral' : 'negative',
        confidence: 0.85,
        risk_keywords: [],
        risk_score: Math.max(0, (5 - moodScore) * 10),
        risk_level: moodScore <= 3 ? 'medium' : 'low',
        action: moodScore <= 3 ? 'ADD_TO_REPORT' : 'LOG_ONLY',
        weekly_summary: 'ملخص الأسبوع: متوسط مزاجك في نطاق طبيعي. حافظ على العادات الإيجابية.',
        user_suggestion: 'نفهم إن النهاردة كانت صعبة، بس إحنا فخورين إنك فاتحتك وقولت. خد وقتك واهتم بنفسك 💙',
      };

      // تحديث التراكر بالتحليل
      if (isSupabaseConfigured()) {
        // AI analysis will be stored
      }

      return NextResponse.json({ analysis: mockAnalysis, source: 'mock' });
    }

    // استدعاء Gemini Flash API فعلي
    const prompt = `You are a mental health AI assistant for an Arabic mental health platform called "Wesal".
Analyze the journal entry and mood score. Return ONLY valid JSON — no explanation, no markdown.

Journal: "${journalText}"
Mood Score: ${moodScore}/10
Recent 7 days mood: ${JSON.stringify(recentLogs || [])}

Required JSON format:
{
  "sentiment": "positive|negative|neutral",
  "confidence": 0.0-1.0,
  "risk_keywords": ["keyword1"],
  "risk_score": 0-100,
  "risk_level": "LOW|MEDIUM|HIGH",
  "action": "LOG_ONLY|ADD_TO_REPORT|ALERT_DOCTOR",
  "weekly_summary": "ملخص بالعربي للدكتور",
  "user_suggestion": "اقتراح دافئ للمستخدم"
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 500 },
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Gemini API error');
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // استخراج JSON من الرد
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON in Gemini response');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // تحديث risk_level في التراكر لو Supabase متوصل
    if (isSupabaseConfigured() && analysis.risk_level) {
      // Store would happen via the calling function
    }

    return NextResponse.json({ analysis, source: 'gemini' });
  } catch (error) {
    return NextResponse.json({
      analysis: {
        sentiment: 'neutral',
        confidence: 0.5,
        risk_keywords: [],
        risk_score: 0,
        risk_level: 'low',
        action: 'LOG_ONLY',
        weekly_summary: 'لم يتمكن من التحليل حالياً',
        user_suggestion: 'جرب تكتب إحساسك مرة تانية لاحقاً 💙',
      },
      source: 'fallback',
      error: 'حصل خطأ في التحليل',
    });
  }
}
