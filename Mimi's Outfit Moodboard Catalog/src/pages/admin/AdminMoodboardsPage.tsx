/**
 * Admin Moodboards Management Page
 * List, search, filter, and manage all moodboards with bulk operations
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
import { moodboardsApi } from '@/services/api/moodboards.api';
import { adminMoodboardsApi } from '@/services/api/admin.api';
import type { Moodboard } from '@/types';
import { 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Search, 
  Loader2,
  X 
} from 'lucide-react';
import { SEO } from '@/components/SEO';

export default function AdminMoodboardsPage() {
  const [moodboards, setMoodboards] = useState<Moodboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadMoodboards();
  }, []);

  const loadMoodboards = async () => {
    try {
      setLoading(true);
      const response = await moodboardsApi.getAllMoodboards({ limit: 1000 });
      setMoodboards(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load moodboards',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await adminMoodboardsApi.deleteMoodboard(id);
      setMoodboards(moodboards.filter(m => m.id !== id));
      toast({
        title: 'Success',
        description: 'Moodboard deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete moodboard',
        variant: 'destructive',
      });
    }
  };

  const handlePublishToggle = async (id: string, currentStatus: boolean) => {
    try {
      const updated = await adminMoodboardsApi.publishMoodboard(id, !currentStatus);
      setMoodboards(moodboards.map(m => m.id === id ? { ...m, isPublished: updated.isPublished } : m));
      toast({
        title: 'Success',
        description: `Moodboard ${!currentStatus ? 'published' : 'unpublished'}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update moodboard status',
        variant: 'destructive',
      });
    }
  };

  // Bulk operations
  const handleSelectAll = () => {
    if (selectedIds.size === filteredMoodboards.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredMoodboards.map(m => m.id)));
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
    if (!confirm(`Are you sure you want to delete ${count} selected moodboard${count > 1 ? 's' : ''}?`)) {
      return;
    }

    try {
      setBulkActionLoading(true);
      
      // Use bulk delete API endpoint
      const result = await adminMoodboardsApi.bulkDelete(Array.from(selectedIds));
      
      // Update UI based on results
      setMoodboards(moodboards.filter(m => !result.success.includes(m.id)));
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
          description: `${count} moodboard${count > 1 ? 's' : ''} deleted successfully`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete moodboards',
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
      const result = await adminMoodboardsApi.bulkPublish(Array.from(selectedIds), true);
      
      // Update UI based on results
      setMoodboards(moodboards.map(m => 
        result.success.includes(m.id) 
          ? { ...m, isFeatured: true } 
          : m
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
          description: `${count} moodboard${count > 1 ? 's' : ''} published successfully`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to publish moodboards',
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
      const result = await adminMoodboardsApi.bulkPublish(Array.from(selectedIds), false);
      
      // Update UI based on results
      setMoodboards(moodboards.map(m => 
        result.success.includes(m.id) 
          ? { ...m, isFeatured: false } 
          : m
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
          description: `${count} moodboard${count > 1 ? 's' : ''} unpublished successfully`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to unpublish moodboards',
        variant: 'destructive',
      });
    } finally {
      setBulkActionLoading(false);
    }
  };

  const filteredMoodboards = moodboards.filter(m =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const isAllSelected = filteredMoodboards.length > 0 && selectedIds.size === filteredMoodboards.length;
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < filteredMoodboards.length;

  return (
    <>
      <SEO
        title="Manage Moodboards - Admin"
        description="Manage moodboard collections"
      />

      <div className="min-h-screen bg-background">
        <AdminHeader />

        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="font-serif text-3xl font-bold mb-2">Moodboards</h1>
              <p className="text-muted-foreground">
                {filteredMoodboards.length} of {moodboards.length} moodboards
              </p>
            </div>
            <Button asChild>
              <Link to="/admin/moodboards/new">
                <Plus className="w-4 h-4 mr-2" />
                Add Moodboard
              </Link>
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search moodboards by title, description, or tags..."
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
          {!loading && filteredMoodboards.length > 0 && (
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

          {/* Moodboards Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredMoodboards.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? 'No moodboards found matching your search' : 'No moodboards yet'}
                </p>
                {!searchQuery && (
                  <Button asChild>
                    <Link to="/admin/moodboards/new">
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Moodboard
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredMoodboards.map((moodboard) => (
                <Card key={moodboard.id} className="overflow-hidden relative">
                  {/* Selection Checkbox */}
                  <div className="absolute top-3 left-3 z-10">
                    <Checkbox
                      checked={selectedIds.has(moodboard.id)}
                      onCheckedChange={() => handleSelectItem(moodboard.id)}
                      className="bg-background border-2 shadow-sm"
                    />
                  </div>

                  <div className="aspect-[4/3] bg-muted relative group">
                    <img
                      src={moodboard.coverImage}
                      alt={moodboard.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        asChild
                      >
                        <Link to={`/admin/moodboards/edit/${moodboard.id}`}>
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        asChild
                      >
                        <Link to={`/moodboards/${moodboard.slug}`}>
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Link>
                      </Button>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{moodboard.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {moodboard.description}
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
                            <Link to={`/admin/moodboards/edit/${moodboard.id}`}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/moodboards/${moodboard.slug}`}>
                              <Eye className="w-4 h-4 mr-2" />
                              View on Site
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handlePublishToggle(moodboard.id, !!moodboard.isFeatured)}
                          >
                            {moodboard.isFeatured ? (
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
                            onClick={() => handleDelete(moodboard.id, moodboard.title)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <p className="text-xs text-muted-foreground">
                        {moodboard.products?.length || 0} products
                      </p>
                      {moodboard.isFeatured && (
                        <Badge variant="secondary" className="text-xs">
                          Featured
                        </Badge>
                      )}
                    </div>

                    {moodboard.tags && moodboard.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {moodboard.tags?.slice(0, 3)?.map((tag) => (
                          <span
                            key={tag}
                            className="inline-block px-2 py-0.5 bg-muted text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {(moodboard.tags?.length || 0) > 3 && (
                          <span className="inline-block px-2 py-0.5 text-xs text-muted-foreground">
                            +{(moodboard.tags?.length || 0) - 3}
                          </span>
                        )}
                      </div>
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
