# Ideator Workflow

## Overview
The Ideator is a fine-tuned LLM wrapper that generates short-form content templates for social media. It creates engaging content structures including hooks, scripts, and visual/audio recommendations based on product or service descriptions.

## Core Components

### 1. Content Generation
- **Input Processing**: Accepts product/service descriptions and target platform specifications
- **Template Generation**: Produces 5 distinct content templates per request
- **Structured Output**: Each template includes:
  - Hook: Attention-grabbing opening
  - Script: Structured content flow
  - Visual Recommendations: Scene descriptions and framing
  - Audio Suggestions: Music style, tone, and sound effects

### 2. Integration Points
- **LLM Service**: Interface with fine-tuned LLM for content generation
- **Content Validation**: Ensure generated content meets platform guidelines
- **Output Formatting**: Standardized JSON structure for downstream processing

### 3. Performance Considerations
- Response time < 5 seconds per generation
- Support for batch processing multiple products
- Caching of common content patterns

## Implementation Plan

### Phase 1: Core Generation
- [ ] Set up LLM wrapper service
- [ ] Define content template schema
- [ ] Implement basic prompt engineering

### Phase 2: Platform Optimization
- [ ] Add platform-specific content rules
- [ ] Implement content validation
- [ ] Add performance monitoring

## Dependencies
- LLM service endpoint
- Content moderation API
- Platform guidelines database