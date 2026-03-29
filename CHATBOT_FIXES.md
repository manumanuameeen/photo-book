# Chatbot Error Handling & Rate Limit Fixes

## Overview

This document describes the comprehensive fixes implemented to handle Groq API rate limits, connection errors, and improve the overall error handling experience in the Photo-book chatbot.

## Problems Solved

### 1. **Rate Limit Errors (429) Not Handled**
**Issue**: When Groq API rate limit was exceeded, the error was caught but not properly displayed to users. The generic error message "Chatbot interaction failed" didn't explain what went wrong.

**Solution**: 
- Backend now detects 429 errors and returns detailed information
- Frontend displays user-friendly message: "Rate limit reached. Please wait before trying again."
- Automatic retry logic with exponential backoff prevents immediate re-attempts

### 2. **No Retry Mechanism**
**Issue**: When errors occurred, users had to manually refresh or restart the chat. No automatic recovery.

**Solution**:
- Implemented `retryWithBackoff.ts` utility with exponential backoff
- Automatically retries failed requests up to 3 times
- Respects Retry-After headers from Groq API
- Integrated into chatbot service for all Groq API calls

### 3. **Error Details Not Displayed in UI**
**Issue**: Errors were shown as generic text in a banner, not as structured cards like other data.

**Solution**:
- Created `ErrorCard.tsx` component with beautiful error display
- Type-specific icons and colors for different error types
- Helpful suggestions for each error type
- One-click retry button

## Implementation Details

### Backend Changes

#### 1. Enhanced Error Handling (`backend/src/routes/ai.routes.ts`)

```typescript
// Detects and categorizes errors:
- 429: Rate limit errors
- 503/504: Service unavailable/timeout
- 401: Authentication errors
- ECONNREFUSED/ENOTFOUND: Connection errors
- ETIMEDOUT: Request timeout

// Returns structured error response:
{
  success: false,
  message: "User-friendly message",
  error: {
    type: "RATE_LIMIT",
    provider: "Groq",
    message: "Detailed error message",
    code: "rate_limit_exceeded"
  }
}
```

#### 2. Retry Utility (`backend/src/utils/retryWithBackoff.ts`)

```typescript
// Exponential backoff configuration:
- Max retries: 3
- Initial delay: 1 second
- Max delay: 30 seconds
- Backoff multiplier: 2x

// Usage:
const result = await callGroqWithRetry(() => model.invoke(...));
```

#### 3. Chatbot Service Integration (`backend/src/services/external/chatbot.service.ts`)

```typescript
// Wrapped model.invoke with retry logic:
let response = await callGroqWithRetry(() =>
  model.invoke([...messages], { signal: controller.signal })
);
```

### Frontend Changes

#### 1. Error Card Component (`frontend/src/components/common/ErrorCard.tsx`)

Features:
- Type-specific icons and colors
- Helpful suggestions for each error type
- Retry button with loading state
- Error details in formatted display

Error types handled:
- **RATE_LIMIT** ⚡: "Too many requests, please wait"
- **CONNECTION_ERROR** 🔌: "Unable to reach service"
- **TIMEOUT** ⏱️: "Request took too long"
- **AUTH_ERROR** 🔐: "Authentication failed"

#### 2. Enhanced AIChatbot Component (`frontend/src/components/common/AIChatbot.tsx`)

Changes:
- Imports and displays ErrorCard component
- Captures error details from backend
- Stores last user message for easy retry
- Implements handleRetry function
- Better error state management

```typescript
interface ChatbotApiResponse {
  success: boolean;
  message: string;
  error?: {
    type?: string;
    provider?: string;
    message?: string;
    code?: string;
    retryAfter?: string;
  };
  // ... other fields
}
```

## User Experience Flow

### Scenario: Rate Limit Error

1. **User sends message** → "Find me a wedding photographer"
2. **Chatbot processes** → Calls Groq API
3. **Rate limit hit** → Groq returns 429 error
4. **Retry logic kicks in** → Waits 2 seconds, retries
5. **Still failing** → Shows error card:
   ```
   ⚡ Connection Error
   Rate limit reached. Please wait before trying again.
   
   Type: RATE_LIMIT
   Service: Groq
   Code: rate_limit_exceeded
   
   💡 Tip: The AI service is receiving too many requests. 
   Please wait a moment and try again.
   
   [Try Again] button
   ```
6. **User clicks "Try Again"** → Message is resent automatically

## Error Types & Handling

| Error Type | HTTP Status | Icon | Suggestion |
|-----------|------------|------|-----------|
| Rate Limit | 429 | ⚡ | Wait and retry |
| Connection Error | 503 | 🔌 | Check internet, try again |
| Timeout | 504 | ⏱️ | Service busy, retry |
| Auth Error | 401 | 🔐 | Contact support |
| Unknown | 500 | ⚠️ | Try again or contact support |

## Configuration

### Retry Settings

Located in `backend/src/utils/retryWithBackoff.ts`:

```typescript
export async function callGroqWithRetry<T>(fn: () => Promise<T>): Promise<T> {
  return retryWithBackoff(fn, {
    maxRetries: 3,           // Number of retry attempts
    initialDelayMs: 2000,    // Start with 2 seconds
    maxDelayMs: 60000,       // Max 60 seconds
    backoffMultiplier: 2,    // Double delay each time
  });
}
```

### Error Detection

Located in `backend/src/routes/ai.routes.ts`:

Customize error detection by modifying the catch block to add new error types or change status codes.

## Testing the Fixes

### Manual Testing

1. **Test Rate Limit**:
   - Send multiple messages rapidly
   - Watch for error card with retry button
   - Click retry and verify message is resent

2. **Test Connection Error**:
   - Disconnect internet (or mock in DevTools)
   - Send message
   - Verify connection error card appears

3. **Test Retry Logic**:
   - Trigger an error
   - Verify automatic retries happen
   - Check browser console for retry logs

### Browser Console

Look for logs like:
```
[Retry] Attempt 1/3 failed. Retrying in 2000ms... 429
[Retry] Attempt 2/3 failed. Retrying in 4000ms... 429
Chat error: Error: Rate limit reached...
```

## Files Modified

### Backend
- `backend/src/routes/ai.routes.ts` - Enhanced error handling
- `backend/src/services/external/chatbot.service.ts` - Retry logic integration
- `backend/src/utils/retryWithBackoff.ts` - NEW: Retry utility

### Frontend
- `frontend/src/components/common/AIChatbot.tsx` - Error display and retry
- `frontend/src/components/common/ErrorCard.tsx` - NEW: Error card component

## Future Improvements

1. **Persistent Error Logging**: Store error logs for analytics
2. **Smart Backoff**: Adjust retry delays based on error type
3. **Circuit Breaker**: Stop retrying if service is down
4. **User Notifications**: Toast notifications for errors
5. **Error Recovery**: Auto-save draft messages during errors
6. **Rate Limit Prevention**: Implement client-side rate limiting

## Deployment Notes

1. **No database migrations required**
2. **No environment variable changes needed**
3. **Backward compatible** with existing code
4. **No breaking changes** to API contracts

## Support & Debugging

### Common Issues

**Q: Error card not showing?**
- A: Check browser console for errors
- Verify ErrorCard component is imported in AIChatbot
- Check that error details are being passed correctly

**Q: Retry button not working?**
- A: Verify handleRetry function is properly bound
- Check that lastUserMessage is being captured
- Ensure messages state is being updated correctly

**Q: Retries not happening?**
- A: Check backend logs for retry attempts
- Verify callGroqWithRetry is wrapping the model.invoke call
- Check that error type matches retry conditions

### Debug Mode

Add this to frontend to see detailed error info:

```typescript
// In AIChatbot.tsx
if (error) {
  console.log('Error Details:', error);
  console.log('Error Type:', error.details?.type);
  console.log('Error Message:', error.details?.message);
}
```

## References

- [Groq API Documentation](https://console.groq.com/docs)
- [Exponential Backoff Strategy](https://en.wikipedia.org/wiki/Exponential_backoff)
- [HTTP Status Codes](https://httpwg.org/specs/rfc9110.html#status.codes)
- [Error Handling Best Practices](https://www.rfc-editor.org/rfc/rfc7231#section-6.5.4)
