"use client";
import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Mail, 
  Send, 
  Users, 
  TrendingUp, 
  Activity,
  Eye,
  MousePointer,
  AlertTriangle,
  UserMinus,
  Calendar,
  Clock,
  RefreshCw
} from "lucide-react";

// Mock data interfaces - replace with your actual API types
interface DashboardMetrics {
  totalCampaigns: number;
  activeCampaigns: number;
  totalTemplates: number;
  totalEmailsSent: number;
  totalDelivered: number;
  totalOpens: number;
  totalClicks: number;
  totalBounces: number;
  totalUnsubscribes: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
}

interface RecentCampaign {
  id: string;
  name: string;
  status: "draft" | "sent" | "scheduled";
  sentDate?: string;
  emailsSent: number;
  openRate: number;
  clickRate: number;
}

interface ActivityItem {
  id: string;
  type: "campaign_sent" | "template_created" | "campaign_created";
  description: string;
  timestamp: string;
}

export default function DashboardMain() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentCampaigns, setRecentCampaigns] = useState<RecentCampaign[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Sample data
      setMetrics({
        totalCampaigns: 3,
        activeCampaigns: 1,
        totalTemplates: 2,
        totalEmailsSent: 125847,
        totalDelivered: 122156,
        totalOpens: 45123,
        totalClicks: 8934,
        totalBounces: 3691,
        totalUnsubscribes: 487,
        openRate: 36.9,
        clickRate: 7.3,
        bounceRate: 2.9,
      });

      setRecentCampaigns([
        {
          id: "1",
          name: "Summer Athletic Recruitment 2025",
          status: "sent",
          sentDate: "2025-11-01",
          emailsSent: 8547,
          openRate: 42.3,
          clickRate: 9.1,
        },
        {
          id: "2", 
          name: "Campus Visit Invitation Campaign",
          status: "sent",
          sentDate: "2025-10-28",
          emailsSent: 3241,
          openRate: 38.7,
          clickRate: 6.8,
        },
        {
          id: "3",
          name: "Winter Training Program Updates",
          status: "scheduled",
          emailsSent: 0,
          openRate: 0,
          clickRate: 0,
        },
        {
          id: "4",
          name: "Scholarship Opportunities Alert",
          status: "draft",
          emailsSent: 0,
          openRate: 0,
          clickRate: 0,
        },
      ]);

      setRecentActivity([
        {
          id: "1",
          type: "campaign_sent",
          description: "Summer Athletic Recruitment 2025 campaign sent to 8,547 recipients",
          timestamp: "2025-11-01T10:30:00Z",
        },
        {
          id: "2",
          type: "template_created", 
          description: "New template created: Athletic Performance Newsletter",
          timestamp: "2025-10-30T15:45:00Z",
        },
        {
          id: "3",
          type: "campaign_created",
          description: "Winter Training Program Updates campaign created",
          timestamp: "2025-10-29T09:15:00Z",
        },
        {
          id: "4",
          type: "campaign_sent",
          description: "Campus Visit Invitation Campaign sent to 3,241 recipients",
          timestamp: "2025-10-28T14:20:00Z",
        },
      ]);

      setLoading(false);
      setLastUpdated(new Date());
    };

    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    // Simulate refresh
    setTimeout(() => {
      setLoading(false);
      setLastUpdated(new Date());
    }, 1000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusBadge = (status: RecentCampaign['status']) => {
    const badges = {
      sent: "bg-green-100 text-green-800 border-green-200",
      scheduled: "bg-blue-100 text-blue-800 border-blue-200", 
      draft: "bg-gray-100 text-gray-800 border-gray-200",
    };

    const labels = {
      sent: "Sent",
      scheduled: "Scheduled",
      draft: "Draft",
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getActivityIcon = (type: ActivityItem['type']) => {
    const icons = {
      campaign_sent: Send,
      template_created: Mail,
      campaign_created: LayoutDashboard,
    };
    
    const Icon = icons[type];
    return <Icon className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-r from-[#1C315F] to-[#243a66] text-white shadow-xl">
          <div className="px-8 py-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <LayoutDashboard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    The College Athlete Network
                  </h1>
                  <h1 className="text-2xl font-bold tracking-tight">
                    Admin Dashboard
                  </h1>
                  <p className="text-blue-100 mt-1">
                    Monitor performance metrics and manage your platform overview
                  </p>
                </div>
              </div>
              <div className="h-10 bg-white/20 rounded-xl w-24 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-8 py-8">
          {/* Metrics Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header Section */}
      <div className="bg-gradient-to-r from-[#1C315F] to-[#243a66] text-white shadow-xl">
        <div className="px-8 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  The College Athlete Network
                </h1>
                <h1 className="text-2xl font-bold tracking-tight">
                  Admin Dashboard
                </h1>
                <p className="text-blue-100 mt-1">
                  Monitor performance metrics and manage your platform overview
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-white/80">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-3 bg-white text-[#1C315F] rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-8">
        {/* Key Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Campaigns */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{metrics.totalCampaigns}</p>
                <p className="text-sm text-gray-500 mt-1">{metrics.activeCampaigns} active</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-[#1C315F] to-[#243a66] rounded-xl flex items-center justify-center">
                <Send className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Total Templates */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Email Templates</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{metrics.totalTemplates}</p>
                <p className="text-sm text-gray-500 mt-1">Ready to use</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Total Emails Sent */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Emails Sent</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{metrics.totalEmailsSent.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">{metrics.totalDelivered.toLocaleString()} delivered</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Open Rate */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Open Rate</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{metrics.openRate}%</p>
                <p className="text-sm text-gray-500 mt-1">{metrics.totalOpens.toLocaleString()} opens</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <MousePointer className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Click Rate</p>
                <p className="text-xl font-bold text-gray-900">{metrics.clickRate}%</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">{metrics.totalClicks.toLocaleString()} total clicks</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Bounce Rate</p>
                <p className="text-xl font-bold text-gray-900">{metrics.bounceRate}%</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">{metrics.totalBounces.toLocaleString()} bounces</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <UserMinus className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Unsubscribes</p>
                <p className="text-xl font-bold text-gray-900">{metrics.totalUnsubscribes.toLocaleString()}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">All time total</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Delivery Rate</p>
                <p className="text-xl font-bold text-gray-900">
                  {((metrics.totalDelivered / metrics.totalEmailsSent) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500">Successfully delivered</p>
          </div>
        </div>
      )}

      {/* Recent Campaigns and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Campaigns */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Campaigns</h3>
              <a 
                href="/admin/campaigns" 
                className="text-sm text-[#1C315F] hover:text-[#243a66] font-medium transition-colors"
              >
                View all →
              </a>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentCampaigns.map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium text-gray-900 truncate">{campaign.name}</h4>
                      {getStatusBadge(campaign.status)}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {campaign.sentDate && (
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(campaign.sentDate)}
                        </span>
                      )}
                      {campaign.emailsSent > 0 && (
                        <span>{campaign.emailsSent.toLocaleString()} sent</span>
                      )}
                    </div>
                  </div>
                  {campaign.status === 'sent' && (
                    <div className="flex space-x-4 text-sm">
                      <div className="text-center">
                        <div className="text-blue-600 font-medium">{campaign.openRate}%</div>
                        <div className="text-gray-500 text-xs">Opens</div>
                      </div>
                      <div className="text-center">
                        <div className="text-green-600 font-medium">{campaign.clickRate}%</div>
                        <div className="text-gray-500 text-xs">Clicks</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTimestamp(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/campaigns"
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-[#1C315F] to-[#243a66] text-white rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            <Send className="w-6 h-6" />
            <div>
              <div className="font-semibold">Create Campaign</div>
              <div className="text-sm text-white/80">Start a new email campaign</div>
            </div>
          </a>
          
          <a
            href="/admin/email-templates"
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            <Mail className="w-6 h-6" />
            <div>
              <div className="font-semibold">Manage Templates</div>
              <div className="text-sm text-white/80">Create and edit email templates</div>
            </div>
          </a>
          
          <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer">
            <Activity className="w-6 h-6" />
            <div>
              <div className="font-semibold">View Analytics</div>
              <div className="text-sm text-white/80">Detailed performance reports</div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}