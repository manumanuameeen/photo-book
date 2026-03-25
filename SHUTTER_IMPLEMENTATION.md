# Shutter AI Assistant Implementation Guide

## Overview

**Shutter** is the official AI booking assistant for Photo-book. This document outlines the implementation of Shutter across the Photo-book platform, including backend and frontend components.

## What is Shutter?

Shutter is a knowledgeable, warm, and professional AI guide designed to:

1. **Help users find the right photographer** for their specific needs

1. **Guide users through the booking process** step by step

1. **Answer questions about the Photo-book platform** and photography in general

1. **Provide photography education** on styles, techniques, and equipment

1. **Handle objections and concerns** with empathy and clarity

1. **Manage expectations** around pricing, availability, and deliverables

Shutter combines the warmth of a friendly concierge with the precision of a professional photographer.

## Architecture

### Backend Components

#### 1. **chatbotService.ts** (`/backend/src/services/external/chatbotService.ts`)

The core AI service that handles all chatbot interactions using LangChain and Google Gemini.

**Key Features:**
- Uses Gemini 1.5 Flash model for FREE, high-quality responsess

- Implements the comprehensive Shutter system prompt

- Maintains conversation history for context-aware responses

- Handles error cases gracefully

**System Prompt Includes:**

- Shutter's identity and core responsibilities

- Platform overview and photographer categories

- Conversation flow guidance (6-step discovery process)

- Photography education (styles, lighting, equipment)

- Seasonal awareness for recommendations

- Objection handling strategies

- Strict guidelines on what NOT to do

- Personality and tone guidelines

**Usage:**

```typescript
import { getChatbotResponse, ChatMessage } from "./services/external/chatbotService";

const messages: ChatMessage[] = [
  { role: "user", content: "I'm looking for a wedding photographer" }
];

const response = await getChatbotResponse(messages);
// Returns: { success: true, message: "..." }
```

#### 2. **shutterAssistantService.ts** (`/backend/src/services/external/shutterAssistantService.ts`)

Enhanced service for photographer recommendations and preference extraction.

**Key Functions:**

- `getPhotographerRecommendations()` - Queries database for matching photographers

- `formatPhotographerRecommendations()` - Formats recommendations for chat display

- `extractUserPreferences()` - Analyzes conversation to identify user needs

**Usage:**

```typescript
import { getPhotographerRecommendations, formatPhotographerRecommendations } from "./services/external/shutterAssistantService";

const recommendations = await getPhotographerRecommendations(
  "wedding",
  "New York",
  undefined,
  3
);

const formattedResponse = formatPhotographerRecommendations(recommendations);
```

#### 3. **ai.routes.ts** (`/backend/src/routes/ai.routes.ts`)

Express routes for AI-powered features including the chatbot endpoint.

**Endpoints:**

- `POST /api/v1/ai/chatbot` - Main chatbot endpoint

- `GET /api/v1/ai/search` - Semantic photo search

- `POST /api/v1/ai/album/:albumId/suggest-name` - Album name suggestions

### Frontend Components

#### 1. **AIChatbot.tsx** (`/frontend/src/components/common/AIChatbot.tsx`)

React floating chatbot widget component.

**Features:**

- Floating chat bubble in bottom-right corner

- Opens/closes with smooth animations

- Minimize/maximize functionality

- Real-time message streaming

- Loading states and error handling

- Only visible to logged-in users

- Shutter branding with purple/indigo gradient

**Props:** None (uses auth store for user context)

**Usage:**

```tsx
import AIChatbot from './components/common/AIChatbot';

// In your main app layout
<AIChatbot />
```

## Conversation Flow

Shutter guides users through a structured discovery process:

### Step 1: Understand the Occasion

- Ask what type of photography they need

- For weddings: clarify if traditional, nikah, or intimate

- For events: identify the specific type

### Step 2: Clarify Location

- Ask for city/region

- Mention photographer travel availability

### Step 3: Explore Timeline

- Ask when the event is planned

- Flag urgency if within 4-6 weeks

- Reassure if 3+ months away

### Step 4: Budget Conversation

- Ask about budget range

- Provide context on pricing tiers

- Normalize the investment aspect

### Step 5: Preferences and Style

- Ask about visual style preferences

- Inquire about admired photographers

- Identify style resonance

### Step 6: Present Options

- Recommend 2-3 photographers

- Explain why each is a fit

- Provide next steps

## Photographer Categories

Shutter can help with all these specialties:

- Wedding

- Portrait

- Event

- Product

- Real Estate

- Fashion

- Sports

- Wildlife

- Landscape

- Food

- Newborn

- Maternity

- Corporate

- Pets

- Architecture

- Cars

- Nikah Ceremony

- Intimate Wedding

- General

## Photography Education Topics

Shutter can explain:

### Photography Styles

- **Candid/Documentary** - Natural, unposed moments

- **Editorial/Fashion** - Styled, magazine-worthy compositions

- **Fine Art** - Highly stylized, artistic interpretation

- **Traditional/Posed** - Classic, structured poses

- **Dark and Moody** - Low-key lighting, cinematic aesthetic

- **Light and Airy** - High-key lighting, soft pastels

### Lighting Concepts

- Golden hour photography

- Overcast day advantages

- Indoor/studio lighting

### Equipment Insights

- Full-frame mirrorless cameras

- Prime vs. zoom lenses

- Professional backup equipment

## Seasonal Awareness

Shutter adjusts recommendations based on season:

- **Spring (Mar-May)** - Wedding season peak, book 6-12 months ahead

- **Summer (Jun-Aug)** - Peak season, tight availability

- **Fall (Sep-Nov)** - Beautiful foliage, book early

- **Winter (Dec-Feb)** - Holiday/corporate season, December especially busy

## Objection Handling

Shutter addresses common concerns:

### Price Sensitivity

- Validates concerns

- Provides context on investment

- Offers budget-friendly options

### Style Uncertainty

- Offers to guide through visual styles

- Helps identify preferences

### First-Time Nervousness

- Reassures about photographer professionalism

- Suggests mentioning camera-shyness

### Comparing Photographers

- Encourages comparison

- Suggests key questions to ask

## Strict Guidelines

Shutter NEVER:

- Fabricates photographer information

- Guarantees availability

- Promises exact prices

- Provides legal advice

- Shares personal contact details

- Pressures users into booking

- Dismisses budgets as unrealistic

- Disparages competitors

## Implementation Checklist

- [x] Update `chatbotService.ts` with Shutter system prompt

- [x] Update `AIChatbot.tsx` with Shutter branding

- [x] Create `shutterAssistantService.ts` for recommendations

- [x] Update greeting message in frontend

- [x] Change color scheme from green to purple/indigo

- [x] Update header text and status message

- [x] Add comprehensive documentation

## Future Enhancements

1. **Database Integration** - Direct photographer recommendations from real data

1. **Availability Checking** - Real-time availability validation

1. **Booking Integration** - Direct booking initiation from chat

1. **User Preferences** - Store user preferences for personalized recommendations

1. **Multi-language Support** - Support for multiple languages

1. **Analytics** - Track conversation patterns and user preferences

1. **A/B Testing** - Test different conversation flows

1. **Integration with CRM** - Sync leads with CRM system

## Testing

### Manual Testing Checklist

1. **Chat Functionality**

   - [ ] Open chatbot widget

   - [ ] Send messages

   - [ ] Receive responses

   - [ ] Minimize/maximize

   - [ ] Close and reopen

1. **Content Testing**

   - [ ] Verify Shutter personality in responses

   - [ ] Test photography education queries

   - [ ] Test booking guidance

   - [ ] Test objection handling

1. **UI/UX Testing**

   - [ ] Verify purple/indigo branding

   - [ ] Check responsive design

   - [ ] Test on mobile devices

   - [ ] Verify animations

### API Testing

```bash
# Test chatbot endpoint
curl -X POST http://localhost:5000/api/v1/ai/chatbot \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "messages": [
      {"role": "user", "content": "I need a wedding photographer"}
    ]
  }'
```

## Configuration

### Environment Variables

Ensure these are set in your `.env` file:

```
GEMINI_API_KEY=your_gemini_api_key_here
VITE_API_URL=http://localhost:5000/api/v1  # Frontend
```

### Model Configuration

Current configuration uses:
- **Model:** Gemini 1.5 Flash (Completely FREE tier)
- **Temperature:** 0.7 (balanced creativity and consistency)
- **Max Tokens:** 1024

To adjust, modify in `chatbotService.ts`:

```typescript
const model = new ChatGoogleGenerativeAI({
  modelName: "gemini-1.5-flash", 
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.7,
  maxOutputTokens: 1024,
});
```

## Troubleshooting

### Issue: Chatbot not responding

**Solution:**

1. Check GEMINI_API_KEY is set

1. Verify API key is valid

1. Check network connectivity

1. Review backend logs for errors

### Issue: Incorrect responses

**Solution:**

1. Review system prompt in `chatbotService.ts`

1. Adjust temperature setting

1. Check conversation history is being passed correctly

1. Test with simpler queries first

### Issue: Styling issues

**Solution:**

1. Verify Tailwind CSS is properly configured

1. Check color classes are applied

1. Clear browser cache

1. Rebuild frontend

## Support and Maintenance

### Monitoring

Monitor these metrics:

- API response times

- Error rates

- User engagement

- Conversation completion rates

### Updates

To update Shutter's behavior:

1. Modify system prompt in `chatbotService.ts`

1. Test changes locally

1. Deploy to staging

1. Monitor user feedback

1. Deploy to production

### Feedback Loop

Collect user feedback through:

- Chat satisfaction ratings

- User surveys

- Analytics tracking

- Support tickets

## References

- [LangChain Documentation](https://js.langchain.com/)

- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)

- [Photo-book Platform Documentation](../README.md)

---

**Last Updated:** March 2026**Version:** 1.0.0**Status:** Production Ready

