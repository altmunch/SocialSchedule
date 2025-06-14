/**
 * LinkedIn Analytics API Endpoint
 * Provides LinkedIn-specific analytics data for the dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { LinkedInInsightsEngine, LinkedInAnalysisRequest } from '@/app/workflows/data_analysis/engines/LinkedInInsightsEngine';
import { LinkedInScanningService } from '@/services/LinkedInScanningService';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const profileId = searchParams.get('profileId');
    const companyId = searchParams.get('companyId');
    const industry = searchParams.get('industry');
    const includeCompetitorAnalysis = searchParams.get('includeCompetitorAnalysis') === 'true';
    const timeframe = searchParams.get('timeframe') || '30d';

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Calculate timeframe dates
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Create analysis request
    const analysisRequest: LinkedInAnalysisRequest = {
      userId,
      platform: 'LINKEDIN' as any,
      timeRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      profileId: profileId || undefined,
      companyId: companyId || undefined,
      industry: industry || undefined,
      includeCompetitorAnalysis,
      timeframe: {
        start: startDate,
        end: endDate
      },
      correlationId: `linkedin-analytics-${Date.now()}`
    };

    // Initialize LinkedIn insights engine
    const insightsEngine = new LinkedInInsightsEngine(supabase);
    
    // Get LinkedIn analytics
    const analyticsResult = await insightsEngine.analyzeLinkedInPresence(analysisRequest);

    if (!analyticsResult.success) {
      return NextResponse.json(
        { 
          error: 'Failed to analyze LinkedIn presence',
          details: analyticsResult.error?.message 
        },
        { status: 500 }
      );
    }

    // Transform data for frontend consumption
    const responseData = {
      analytics: analyticsResult.data,
      metadata: {
        timeframe,
        generatedAt: new Date().toISOString(),
        userId,
        profileId,
        companyId,
        correlationId: analysisRequest.correlationId
      }
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('LinkedIn analytics API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId, 
      platformAccountId, 
      scanType = 'full', 
      includeCompanyData = true,
      priority = 'medium' 
    } = body;

    if (!userId || !platformAccountId) {
      return NextResponse.json(
        { error: 'userId and platformAccountId are required' },
        { status: 400 }
      );
    }

    // Initialize LinkedIn scanning service
    const scanningService = new LinkedInScanningService(supabase);

    // Trigger LinkedIn data scan
    const scanResult = await scanningService.scanLinkedInData({
      userId,
      platformAccountId,
      scanType,
      includeCompanyData,
      priority
    });

    if (!scanResult.success) {
      const statusCode = scanResult.error?.code === 'RATE_LIMIT_EXCEEDED' ? 429 : 500;
      
      return NextResponse.json(
        {
          error: scanResult.error?.message || 'Scan failed',
          code: scanResult.error?.code,
          retryAfter: scanResult.error?.retryAfter,
          nextScanTime: scanResult.nextScanTime
        },
        { status: statusCode }
      );
    }

    return NextResponse.json({
      success: true,
      data: scanResult.data,
      nextScanTime: scanResult.nextScanTime,
      message: 'LinkedIn data scan completed successfully'
    });

  } catch (error) {
    console.error('LinkedIn scan API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, settings } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'updateScanSettings':
        // Update LinkedIn scanning settings
        const { data, error } = await supabase
          .from('user_linkedin_settings')
          .upsert({
            user_id: userId,
            scan_frequency: settings.scanFrequency || 'daily',
            include_company_data: settings.includeCompanyData ?? true,
            priority: settings.priority || 'medium',
            auto_scan_enabled: settings.autoScanEnabled ?? true,
            updated_at: new Date().toISOString()
          });

        if (error) {
          return NextResponse.json(
            { error: 'Failed to update settings', details: error.message },
            { status: 500 }
          );
        }

        return NextResponse.json({ 
          success: true, 
          message: 'LinkedIn settings updated successfully' 
        });

      case 'updateAnalyticsPreferences':
        // Update LinkedIn analytics preferences
        const preferencesResult = await supabase
          .from('user_analytics_preferences')
          .upsert({
            user_id: userId,
            platform: 'linkedin',
            show_competitor_analysis: settings.showCompetitorAnalysis ?? true,
            show_demographic_breakdown: settings.showDemographicBreakdown ?? true,
            show_content_insights: settings.showContentInsights ?? true,
            default_timeframe: settings.defaultTimeframe || '30d',
            updated_at: new Date().toISOString()
          });

        if (preferencesResult.error) {
          return NextResponse.json(
            { error: 'Failed to update preferences', details: preferencesResult.error.message },
            { status: 500 }
          );
        }

        return NextResponse.json({ 
          success: true, 
          message: 'Analytics preferences updated successfully' 
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('LinkedIn settings API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const dataType = searchParams.get('dataType') || 'all';

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    let deletedCount = 0;

    switch (dataType) {
      case 'posts':
        const postsResult = await supabase
          .from('raw_linkedin_posts')
          .delete()
          .eq('user_id', userId);
        
        if (postsResult.error) throw postsResult.error;
        break;

      case 'profile':
        const profileResult = await supabase
          .from('raw_linkedin_profiles')
          .delete()
          .eq('user_id', userId);
        
        if (profileResult.error) throw profileResult.error;
        break;

      case 'company':
        const companyResult = await supabase
          .from('raw_linkedin_companies')
          .delete()
          .eq('user_id', userId);
        
        if (companyResult.error) throw companyResult.error;
        break;

      case 'all':
      default:
        // Delete all LinkedIn data for the user
        const [posts, profiles, companies] = await Promise.all([
          supabase.from('raw_linkedin_posts').delete().eq('user_id', userId),
          supabase.from('raw_linkedin_profiles').delete().eq('user_id', userId),
          supabase.from('raw_linkedin_companies').delete().eq('user_id', userId)
        ]);

        if (posts.error || profiles.error || companies.error) {
          throw new Error('Failed to delete some LinkedIn data');
        }
        break;
    }

    return NextResponse.json({
      success: true,
      message: `LinkedIn ${dataType} data deleted successfully`,
      deletedCount
    });

  } catch (error) {
    console.error('LinkedIn delete API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 