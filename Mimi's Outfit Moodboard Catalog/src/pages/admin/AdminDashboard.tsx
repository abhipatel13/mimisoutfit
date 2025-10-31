/**
 * Admin Dashboard
 * Overview and quick actions
 */

import { Link } from 'react-router-dom';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Grid3x3, Plus, TrendingUp, Eye, Star, Shield, BarChart3 } from 'lucide-react';
import { SEO } from '@/components/SEO';

export default function AdminDashboard() {
  // In real implementation, fetch these stats from API
  const stats = {
    totalProducts: 52,
    totalMoodboards: 10,
    featuredProducts: 8,
    featuredMoodboards: 4,
  };

  return (
    <>
      <SEO
        title="Admin Dashboard"
        description="Manage The Lookbook by Mimi"
      />

      <div className="min-h-screen bg-background">
        <AdminHeader />

        <div className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="font-serif text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your products, moodboards, and content
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Products
                </CardTitle>
                <Package className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.featuredProducts} featured
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Moodboards
                </CardTitle>
                <Grid3x3 className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalMoodboards}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.featuredMoodboards} featured
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Featured Items
                </CardTitle>
                <Star className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.featuredProducts + stats.featuredMoodboards}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across all content
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Analytics
                </CardTitle>
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">✓</div>
                <p className="text-xs text-muted-foreground mt-1">
                  View insights
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Analytics
                </CardTitle>
                <CardDescription>
                  View user behavior insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/admin/analytics">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Dashboard
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Products
                </CardTitle>
                <CardDescription>
                  Manage your product catalog
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-3">
                <Button asChild className="flex-1">
                  <Link to="/admin/products/new">
                    <Plus className="w-4 h-4 mr-2" />
                    New Product
                  </Link>
                </Button>
                <Button variant="outline" asChild className="flex-1">
                  <Link to="/admin/products">
                    <Eye className="w-4 h-4 mr-2" />
                    View All
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Grid3x3 className="w-5 h-5" />
                  Moodboards
                </CardTitle>
                <CardDescription>
                  Create and edit moodboards
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-3">
                <Button asChild className="flex-1">
                  <Link to="/admin/moodboards/new">
                    <Plus className="w-4 h-4 mr-2" />
                    New Moodboard
                  </Link>
                </Button>
                <Button variant="outline" asChild className="flex-1">
                  <Link to="/admin/moodboards">
                    <Eye className="w-4 h-4 mr-2" />
                    View All
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
