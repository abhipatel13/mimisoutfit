/**
 * Admin Products Management Page
 * List, search, filter, and manage all products with bulk operations
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { productsApi } from '@/services/api/products.api';
import { adminProductsApi } from '@/services/api/admin.api';
import type { Product } from '@/types';
import { 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Search, 
  Loader2,
  CheckSquare,
  Square,
  X
} from 'lucide-react';
import { SEO } from '@/components/SEO';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productsApi.getAllProducts({ limit: 1000 });
      setProducts(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load products',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await adminProductsApi.deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive',
      });
    }
  };

  const handlePublishToggle = async (id: string, currentStatus: boolean) => {
    try {
      const updated = await adminProductsApi.publishProduct(id, !currentStatus);
      setProducts(products.map(p => p.id === id ? { ...p, isPublished: updated.isPublished } : p));
      toast({
        title: 'Success',
        description: `Product ${!currentStatus ? 'published' : 'unpublished'}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update product status',
        variant: 'destructive',
      });
    }
  };

  // Bulk operations
  const handleSelectAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const handleSelectItem = (id: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedIds(newSelection);
  };

  const handleBulkDelete = async () => {
    const count = selectedIds.size;
    if (!confirm(`Are you sure you want to delete ${count} selected product${count > 1 ? 's' : ''}?`)) {
      return;
    }

    try {
      setBulkActionLoading(true);
      
      // Use bulk delete API endpoint
      const result = await adminProductsApi.bulkDelete(Array.from(selectedIds));
      
      // Update UI based on results
      setProducts(products.filter(p => !result.success.includes(p.id)));
      setSelectedIds(new Set());
      
      if (result.failedCount > 0) {
        toast({
          title: 'Partial Success',
          description: `${result.successCount} deleted, ${result.failedCount} failed`,
          variant: 'default',
        });
      } else {
        toast({
          title: 'Success',
          description: `${count} product${count > 1 ? 's' : ''} deleted successfully`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete products',
        variant: 'destructive',
      });
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkPublish = async () => {
    const count = selectedIds.size;
    
    try {
      setBulkActionLoading(true);
      
      // Use bulk publish API endpoint
      const result = await adminProductsApi.bulkPublish(Array.from(selectedIds), true);
      
      // Update UI based on results
      setProducts(products.map(p => 
        result.success.includes(p.id) 
          ? { ...p, isFeatured: true } 
          : p
      ));
      
      setSelectedIds(new Set());
      
      if (result.failedCount > 0) {
        toast({
          title: 'Partial Success',
          description: `${result.successCount} published, ${result.failedCount} failed`,
          variant: 'default',
        });
      } else {
        toast({
          title: 'Success',
          description: `${count} product${count > 1 ? 's' : ''} published successfully`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to publish products',
        variant: 'destructive',
      });
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkUnpublish = async () => {
    const count = selectedIds.size;
    
    try {
      setBulkActionLoading(true);
      
      // Use bulk publish API endpoint with publish: false
      const result = await adminProductsApi.bulkPublish(Array.from(selectedIds), false);
      
      // Update UI based on results
      setProducts(products.map(p => 
        result.success.includes(p.id) 
          ? { ...p, isFeatured: false } 
          : p
      ));
      
      setSelectedIds(new Set());
      
      if (result.failedCount > 0) {
        toast({
          title: 'Partial Success',
          description: `${result.successCount} unpublished, ${result.failedCount} failed`,
          variant: 'default',
        });
      } else {
        toast({
          title: 'Success',
          description: `${count} product${count > 1 ? 's' : ''} unpublished successfully`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to unpublish products',
        variant: 'destructive',
      });
    } finally {
      setBulkActionLoading(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isAllSelected = filteredProducts.length > 0 && selectedIds.size === filteredProducts.length;
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < filteredProducts.length;

  return (
    <>
      <SEO
        title="Manage Products - Admin"
        description="Manage product catalog"
      />

      <div className="min-h-screen bg-background">
        <AdminHeader />

        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="font-serif text-3xl font-bold mb-2">Products</h1>
              <p className="text-muted-foreground">
                {filteredProducts.length} of {products.length} products
              </p>
            </div>
            <Button asChild>
              <Link to="/admin/products/new">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Link>
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products by name, brand, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Bulk Actions Toolbar */}
          {selectedIds.size > 0 && (
            <Card className="mb-6 border-primary/50 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-sm font-medium">
                      {selectedIds.size} selected
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedIds(new Set())}
                      className="h-8"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Clear
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkPublish}
                      disabled={bulkActionLoading}
                      className="h-8"
                    >
                      {bulkActionLoading ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <Eye className="w-4 h-4 mr-1" />
                      )}
                      Publish All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkUnpublish}
                      disabled={bulkActionLoading}
                      className="h-8"
                    >
                      {bulkActionLoading ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <EyeOff className="w-4 h-4 mr-1" />
                      )}
                      Unpublish All
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkDelete}
                      disabled={bulkActionLoading}
                      className="h-8"
                    >
                      {bulkActionLoading ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-1" />
                      )}
                      Delete All
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Select All Control */}
          {!loading && filteredProducts.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
                className={isSomeSelected ? 'data-[state=checked]:bg-primary/50' : ''}
              />
              <label 
                className="text-sm font-medium cursor-pointer select-none"
                onClick={handleSelectAll}
              >
                {isAllSelected ? 'Deselect all' : 'Select all'}
                {isSomeSelected && ` (${selectedIds.size} selected)`}
              </label>
            </div>
          )}

          {/* Products Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? 'No products found matching your search' : 'No products yet'}
                </p>
                {!searchQuery && (
                  <Button asChild>
                    <Link to="/admin/products/new">
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Product
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden relative">
                  {/* Selection Checkbox */}
                  <div className="absolute top-3 left-3 z-10">
                    <Checkbox
                      checked={selectedIds.has(product.id)}
                      onCheckedChange={() => handleSelectItem(product.id)}
                      className="bg-background border-2 shadow-sm"
                    />
                  </div>

                  <div className="aspect-square bg-muted relative group">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        asChild
                      >
                        <Link to={`/admin/products/edit/${product.id}`}>
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        asChild
                      >
                        <Link to={`/products/${product.slug}`}>
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Link>
                      </Button>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{product.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {product.brand}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="shrink-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/products/edit/${product.id}`}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/products/${product.slug}`}>
                              <Eye className="w-4 h-4 mr-2" />
                              View on Site
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handlePublishToggle(product.id, !!product.isFeatured)}
                          >
                            {product.isFeatured ? (
                              <>
                                <EyeOff className="w-4 h-4 mr-2" />
                                Unpublish
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4 mr-2" />
                                Publish
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(product.id, product.name)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="font-semibold">
                        ${product.price?.toFixed(2) || '—'}
                      </p>
                      {product.isFeatured && (
                        <Badge variant="secondary" className="text-xs">
                          Featured
                        </Badge>
                      )}
                    </div>

                    {product.category && (
                      <p className="text-xs text-muted-foreground mt-2 capitalize">
                        {product.category}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
