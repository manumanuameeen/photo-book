# Shutter AI Assistant Implementation Guide

## Overview

**Shutter** is the official AI booking assistant for Photo-book. This document outlines the implementation of Shutter across the Photo-book platform, including backend and frontend components.

## What is Shutter?

Shutter is a knowledgeable, warm, and professional AI guide designed to:

1. **Help users find the right photographer** for their specific needs
2. **Guide users through the booking process** step by step
3. **Answer questions about the Photo-book platform** and photography in general
4. **Provide photography education** on styles, techniques, and equipment
5. **Handle objections and concerns** with empathy and clarity
6. **Manage expectations** around pricing, availability, and deliverables

Shutter combines the warmth of a friendly concierge with the precision of a professional photographer.

## Architecture

### Backend Components

#### 1. **chatbotService.ts** (`/backend/src/services/external/chatbotService.ts`)

The core AI service that handles all chatbot interactions using LangChain and OpenAI.

**Key Features:**
- Uses GPT-4o-mini model for cost-effective, high-quality responses
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
2. **Availability Checking** - Real-time availability validation
3. **Booking Integration** - Direct booking initiation from chat
4. **User Preferences** - Store user preferences for personalized recommendations
5. **Multi-language Support** - Support for multiple languages
6. **Analytics** - Track conversation patterns and user preferences
7. **A/B Testing** - Test different conversation flows
8. **Integration with CRM** - Sync leads with CRM system

## Testing

### Manual Testing Checklist

1. **Chat Functionality**
   - [ ] Open chatbot widget
   - [ ] Send messages
   - [ ] Receive responses
   - [ ] Minimize/maximize
   - [ ] Close and reopen

2. **Content Testing**
   - [ ] Verify Shutter personality in responses
   - [ ] Test photography education queries
   - [ ] Test booking guidance
   - [ ] Test objection handling

3. **UI/UX Testing**
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
OPENAI_API_KEY=your_openai_api_key
VITE_API_URL=http://localhost:5000/api/v1  # Frontend
```

### Model Configuration

Current configuration uses:
- **Model:** GPT-4o-mini
- **Temperature:** 0.7 (balanced creativity and consistency)
- **Max Tokens:** Default (varies by model)

To adjust, modify in `chatbotService.ts`:

```typescript
const model = new ChatOpenAI({
  modelName: "gpt-4o-mini", // Change model here
  temperature: 0.7,          // Adjust creativity (0-1)
  openAIApiKey: process.env.OPENAI_API_KEY,
});
```

## Troubleshooting

### Issue: Chatbot not responding

**Solution:**
1. Check OPENAI_API_KEY is set
2. Verify API key is valid
3. Check network connectivity
4. Review backend logs for errors

### Issue: Incorrect responses

**Solution:**
1. Review system prompt in `chatbotService.ts`
2. Adjust temperature setting
3. Check conversation history is being passed correctly
4. Test with simpler queries first

### Issue: Styling issues

**Solution:**
1. Verify Tailwind CSS is properly configured
2. Check color classes are applied
3. Clear browser cache
4. Rebuild frontend

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
2. Test changes locally
3. Deploy to staging
4. Monitor user feedback
5. Deploy to production

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

**Last Updated:** March 2026
**Version:** 1.0.0
**Status:** Production Ready
