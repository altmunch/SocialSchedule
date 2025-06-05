# Project Tracker - ClipsCommerce

## project structure:

data collection -> data analysis -> deliverables
- use the apis     - engagement     - opt. posting schedule
- user and comps   - peak times     - filtered content, hook gen
                   - patterns       - simple to understand report
                   - high performing content
                   - competitor analysis (niche-based)
                   - historical performance comparison
-------------------------------------------------------------------
      learning ML model that tweaks the whole process(weights)

## implementations needed:

**analysis**:
- [ ] ComprehensiveAnalysisService (orchestrator: integrated competitor & historical analysis)
  - [ ] Unit tests (in progress)
- [x] competitor_analysis_service.ts (foundational)
- [x] historical_analysis_service.ts (foundational)
- [ ] competitor analysis (integration & UI)
- [ ] historical performance comparison (integration & UI)

**delivery**:
- [ ] opt. content(hastags, captions, product link placements, audio)
  - [x] hashtag_optimizer.ts (foundational service created)
- [x] opt. posting schedule (foundational services: EngagementPredictor, ScheduleOptimizer)
- [ ] filtered content, hook gen
- [ ] simple to understand report