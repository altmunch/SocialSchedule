# System Flow Diagrams

## 1. Data Collection Pipeline
┌─────────────────────────────────────────────────────────────┐
│  [Data Collection]                                          │
│  ┌─────────────────┐     ┌───────────────────────┐          │
│  │                 │     │                       │          │
│  │   Start Scan    │────▶│  Initialize Platform  │         │
│  │                 │     │       Clients         │          │
│  └─────────────────┘     └──────────┬────────────┘          │
│                                    │                        │
│                                    ▼                        │
│  ┌─────────────────┐     ┌───────────────────────┐          │
│  │                 │     │                       │          │
│  │  Fetch User    │◀────┤  Platform Clients     │          │
│  │     Posts      │      │  (TikTok, Instagram,  │          │
│  └───────┬────────┘      │       YouTube)        │          │
│          │               └──────────┬────────────┘          │
│          │                          │                       │
│          ▼                          ▼                       │
│  ┌─────────────────┐     ┌───────────────────────┐          │
│  │                 │     │                       │          │
│  │  Store Raw Data │     │   Trigger Analysis    │          │
│  │   in Database   │────▶│   (Core Pipeline)    │          │
│  └─────────────────┘     └───────────────────────┘          │
└─────────────────────────────────────────────────────────────┘

data request -> data

## 2. Core Analysis Pipeline
┌─────────────────────────────────────────────────────────────┐
│  [Core Analysis]                                            │
│  ┌─────────────┐    ┌─────────────────┐   ┌──────────┐      │
│  │             │    │                 │   │          │      │
│  │   Post      │    │    Temporal     │   │  Content │      │
│  │ Analysis    │◀───┤    Analysis    │◀──│ Analysis│       │
│  │             │    │                 │   │          │      │
│  └──────┬──────┘    └─────────────────┘   └──────────┘      │
│         │                      │                  │         │
│         ▼                      ▼                  ▼         │
│  ┌─────────────┐    ┌─────────────────┐   ┌──────────┐      │
│  │ Engagement  │    │  Peak Times &   │   │ Hashtag  │      │
│  │  Scoring    │    │   Patterns      │   │ & Content│      │
│  └─────────────┘    └─────────────────┘   └──────────┘      │
└─────────────────────────────────────────────────────────────┘

Data Flow:
data + analysis request -> engagement score, peak times, patterns, hashtag and content

## 3. Deliverables Generation Pipeline

┌─────────────────────────────────────────────────────────────┐
│  [Deliverables Generation]                                  │
│  ┌───────────────────────┐    ┌───────────────────────┐     │
│  │                       │    │                       │     │
│  │   Analysis Results    │───▶│   Generate Reports    │    │
│  │   (JSON/CSV)          │    │   & Deliverables      │     │
│  └───────────────────────┘    └──────────┬────────────┘     │
│                                          │                  │
│                                          ▼                  │
│  ┌───────────────────────┐    ┌───────────────────────┐     │
│  │                       │    │                       │     │
│  │  Optimized Posting    │    │  Video Optimization   │     │
│  │      Schedule         │    │   Recommendations     │     │
│  └───────────────────────┘    └───────────────────────┘     │
└─────────────────────────────────────────────────────────────┘

analysis results -> optimized posting schedule, video optimization recommendations

## 4. System Monitoring Pipeline

┌─────────────────────────────────────────────────────────────┐
│  [System Monitoring]                                        │
│  ┌──────────────────────┐     ┌───────────────────────┐     │
│  │                      │     │                       │     │
│  │   Error Tracking     │◀───│    System Health      │     │
│  │     & Alerts         │     │      Monitoring       │     │
│  └──────────┬───────────┘     └──────────┬────────────┘     │
│             │                            │                  │
│             ▼                            ▼                  │
│  ┌───────────────────────┐    ┌───────────────────────┐     │
│  │                       │    │                       │     │
│  │  Performance Metrics  │    │  Usage Analytics      │     │
│  │    & Dashboards       │    │    & Reporting        │     │
│  └───────────────────────┘    └───────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
