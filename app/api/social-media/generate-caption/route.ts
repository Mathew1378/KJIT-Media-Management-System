import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || !['SOCIAL_MEDIA_HANDLER', 'ADMIN'].includes(user.role)) {
    return NextResponse.json({ error: 'Unauthorized for caption generation' }, { status: 403 });
  }

  try {
    const { eventId } = await req.json();

    if (!eventId) {
      return NextResponse.json({ error: 'eventId is required' }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        createdBy: { select: { name: true, department: true } },
        approvalSteps: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // STRICT APPROVAL GATE VERIFICATION
    const deanApproved = event.approvalSteps.some((step) => step.stage === 'DEAN' && step.status === 'APPROVED');
    const hodApproved = event.approvalSteps.some((step) => step.stage === 'HOD' && step.status === 'APPROVED');
    const coordApproved = event.approvalSteps.some((step) => step.stage === 'COORDINATOR' && step.status === 'APPROVED');

    if (!deanApproved || !hodApproved || !coordApproved) {
      return NextResponse.json(
        { error: 'Cannot generate caption: Event has not completed all departmental approvals.' },
        { status: 403 }
      );
    }

    // Extract structured verified data from DB
    let dignitaries: any[] = [];
    try {
      dignitaries = JSON.parse(event.dignitariesJson || '[]');
    } catch (e) {}

    const formattedDate = new Date(event.dateTime).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

    let generatedCaption = '';
    let isAiGenerated = false;
    let provider = 'template';

    if (apiKey) {
      try {
        const prompt = `You are an official social media manager for Kristu Jayanti Institute of Technology (KJIT), Bengaluru.
Write an engaging, professional, and institutional Instagram/Facebook reel caption based STRICTLY on the following verified event data stored in the database.

CRITICAL INSTRUCTION:
DO NOT invent any names, speakers, designations, dates, locations, achievements, statistics, attendance numbers, awards, claims, quotes, or unverified information. Use ONLY the factual information provided below.

VERIFIED EVENT DATA:
- Event Title: ${event.name}
- Category: ${event.category}
- Date: ${formattedDate}
- Venue: ${event.venue}
- Organizing Department: ${event.createdBy?.department || 'School of Computer Science & Technology'}
- Faculty Coordinator: ${event.createdBy?.name || 'N/A'}
- Chief Guest / Speaker: ${event.chiefGuest || 'N/A'}
- Dignitaries: ${dignitaries.length > 0 ? dignitaries.map((d: any) => `${d.name} (${d.designation}, ${d.organisation})`).join('; ') : 'N/A'}
- Target Audience & Expected Count: ${event.expectedAudience}
- Special Notes: ${event.specialInstructions || 'N/A'}

Format the caption with:
1. An engaging hook title with appropriate emoji.
2. A clear paragraph outlining the event facts.
3. Relevant institutional hashtags (e.g. #KristuJayanti #KJIT #InstitutionalExcellence #${event.category.replace(/\s+/g, '')}).`;

        const apiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 500 },
          }),
        });

        if (apiRes.ok) {
          const resData = await apiRes.json();
          const text = resData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            generatedCaption = text.trim();
            isAiGenerated = true;
            provider = 'gemini';
          }
        }
      } catch (err) {
        console.warn('[Gemini API Fetch Warning] Falling back to structured template caption generator', err);
      }
    }

    // Fallback structured template generator strictly using database facts
    if (!generatedCaption) {
      const dignitaryStr = dignitaries.length > 0
        ? `\n\nVIP Guests & Dignitaries:\n` + dignitaries.map((d: any) => `• ${d.name} — ${d.designation} (${d.organisation})`).join('\n')
        : '';
      const chiefGuestStr = event.chiefGuest ? `\n• Chief Guest / Speaker: ${event.chiefGuest}` : '';

      generatedCaption = `🎬 HIGHLIGHTS | ${event.name.toUpperCase()} 🌟

Kristu Jayanti Institute of Technology hosted ${event.name} under the category of ${event.category}.

📅 Date: ${formattedDate}
📍 Venue: ${event.venue}
🏛️ Department: ${event.createdBy?.department || 'School of Computer Science & Technology'}${chiefGuestStr}${dignitaryStr}

👥 Target Audience: ${event.expectedAudience}
Faculty Coordinator: ${event.createdBy?.name}

#KristuJayanti #KJIT #${event.category.replace(/\s+/g, '')} #DepartmentEvents #BengaluruCampus #ExcellenceInEducation`;
    }

    await logAudit({
      userId: user.id,
      userName: user.name,
      role: user.role,
      action: 'AI_CAPTION_GENERATED',
      details: `Generated social media caption for event "${event.name}" using provider: ${provider}.`,
    });

    return NextResponse.json({
      caption: generatedCaption,
      isAiGenerated,
      provider,
    });
  } catch (err: any) {
    console.error('[Generate Caption Error]', err);
    return NextResponse.json({ error: 'Failed to generate caption' }, { status: 500 });
  }
}
