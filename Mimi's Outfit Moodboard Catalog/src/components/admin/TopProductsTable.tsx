/**
 * Top Products Analytics Table
 */

import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Heart, ExternalLink, TrendingUp } from 'lucide-react';
import type { PopularProduct } from '@/types/analytics.types';

interface TopProductsTableProps {
  products: PopularProduct[];
  loading?: boolean;
}

export function TopProductsTable({ products, loading }: TopProductsTableProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
          <CardDescription>Most viewed products in selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 w-full animate-pulse bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Top Products</CardTitle>
        <CardDescription className="text-xs sm:text-sm">Most viewed products in selected period</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Mobile Card View */}
        <div className="block lg:hidden space-y-3">
          {products.map((product, index) => (
            <Link 
              key={product.id}
              to={`/products/${product.slug}`}
              className="block p-3 rounded-lg border hover:border-primary hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-3">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded border flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm mb-1 truncate">
                    {product.name}
                  </p>
                  {product.brand && (
                    <p className="text-xs text-muted-foreground mb-2 truncate">
                      {product.brand}
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-muted-foreground" />
                      <span className="font-medium">{product.viewCount.toLocaleString()}</span>
                      <span className="text-muted-foreground">views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ExternalLink className="w-3 h-3 text-muted-foreground" />
                      <span className="font-medium">{product.clickCount}</span>
                      <span className="text-muted-foreground">clicks</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-muted-foreground" />
                      <span>{product.favoriteCount}</span>
                      <span className="text-muted-foreground">favs</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-green-600" />
                      <span className="font-medium text-green-600">
                        {product.conversionRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Unique</TableHead>
                <TableHead className="text-right">Favorites</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead className="text-right">Conv. Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product, index) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Link 
                      to={`/products/${product.slug}`}
                      className="flex items-center gap-3 hover:underline group"
                    >
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded border"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate group-hover:text-primary">
                          {product.name}
                        </p>
                        {product.brand && (
                          <p className="text-sm text-muted-foreground truncate">
                            {product.brand}
                          </p>
                        )}
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Eye className="w-3 h-3 text-muted-foreground" />
                      <span className="font-medium">{product.viewCount.toLocaleString()}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-muted-foreground">
                      {product.uniqueViewers.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Heart className="w-3 h-3 text-muted-foreground" />
                      <span>{product.favoriteCount}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <ExternalLink className="w-3 h-3 text-muted-foreground" />
                      <span className="font-medium">{product.clickCount}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <TrendingUp className="w-3 h-3 text-green-600" />
                      <span className="font-medium text-green-600">
                        {product.conversionRate.toFixed(1)}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
