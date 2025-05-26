# SCAN Phase Implementation

This module implements the SCAN phase of the SocialSchedule application, responsible for aggregating and analyzing social media data to identify patterns and optimize posting schedules.

## Features

- **Multi-platform Support**: Currently supports TikTok, with a modular architecture for adding more platforms
- **Competitor Analysis**: Track and analyze competitor performance
- **Engagement Analytics**: Calculate engagement rates and identify top-performing content
- **Peak Time Detection**: Find optimal posting times based on historical data
- **RESTful API**: Easy integration with frontend components

## Architecture

```
src/app/1. scan/
├── api/
│   ├── initiate/         # POST /api/scan/initiate
│   └── status/[scanId]/   # GET /api/scan/status/:scanId
├── services/
│   ├── analysis/        # Data analysis utilities
│   ├── platforms/         # Platform-specific implementations
│   ├── ScannerService.ts  # Main service orchestrator
│   └── types.ts          # Shared type definitions
└── README.md             # This file
```

## Getting Started

1. **Environment Variables**
   Ensure these environment variables are set:
   ```
   TIKTOK_ACCESS_TOKEN=your_tiktok_access_token
   ```

2. **Initiating a Scan**
   ```typescript
   const response = await fetch('/api/scan/initiate', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       userId: 'user123',
       options: {
         platforms: ['tiktok'],
         competitors: ['@competitor1'],
         lookbackDays: 30,
         includeOwnPosts: true
       }
     })
   });
   const { scanId } = await response.json();
   ```

3. **Checking Scan Status**
   ```typescript
   const response = await fetch(`/api/scan/status/${scanId}`);
   const scanResult = await response.json();
   ```

## Extending to New Platforms

1. Create a new platform client in `services/platforms/` that extends `BasePlatformClient`
2. Implement the required methods:
   - `getPostMetrics(postId: string)`
   - `getUserPosts(userId: string, lookbackDays?: number)`
   - `getCompetitorPosts(username: string, lookbackDays?: number)`
3. Update `ScannerService.initializePlatforms()` to include your new platform

## Performance Considerations

- **Rate Limiting**: Built-in rate limiting (5 requests/second) to prevent API throttling
- **Background Processing**: Scans run asynchronously to avoid blocking the main thread
- **Result Caching**: Scan results are cached for 24 hours

## Error Handling

All API endpoints return appropriate HTTP status codes and error messages in the format:
```typescript
{
  error: string;          // Human-readable error message
  details?: string;        // Technical details (in development)
  code?: string;          // Error code for programmatic handling
}
```

## Testing

Unit tests can be added in a `__tests__` directory following the same structure as the source code.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
