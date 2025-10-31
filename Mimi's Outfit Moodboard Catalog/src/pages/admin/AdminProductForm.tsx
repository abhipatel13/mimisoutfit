/**
 * Admin Product Form
 * Create and edit products
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { productsApi } from '@/services/api/products.api';
import { adminProductsApi } from '@/services/api/admin.api';
import type { CreateProductDto } from '@/types/admin.types';
import { Save, Loader2, ArrowLeft } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { ImageUploadField } from '@/components/admin/ImageUploadField';
import { apiConfig } from '@/config/api.config';
import { upload } from '@devvai/devv-code-backend';

export default function AdminProductForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);

  const [formData, setFormData] = useState<CreateProductDto>({
    name: '',
    slug: '',
    price: null,
    imageUrl: '',
    blurhash: undefined,
    affiliateUrl: '',
    brand: '',
    category: '',
    description: '',
    tags: [],
    isFeatured: false,
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (isEdit && id) {
      loadProduct(id);
    }
  }, [id, isEdit]);

  const loadProduct = async (productId: string) => {
    try {
      setInitialLoading(true);
      const product = await productsApi.getProductById(productId);
      if (product) {
        setFormData({
          name: product.name,
          slug: product.slug,
          price: product.price,
          imageUrl: product.imageUrl,
          affiliateUrl: product.affiliateUrl,
          purchaseType: product.purchaseType || 'affiliate',
          brand: product.brand || '',
          category: product.category || '',
          description: product.description || '',
          tags: product.tags || [],
          isFeatured: product.isFeatured || false,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load product',
        variant: 'destructive',
      });
      navigate('/admin/products');
    } finally {
      setInitialLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({ ...formData, name });
    if (!isEdit) {
      setFormData(prev => ({ ...prev, name, slug: generateSlug(name) }));
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags?.includes(tag)) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tag],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(t => t !== tag) || [],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.slug || !formData.imageUrl || !formData.affiliateUrl) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      if (isEdit && id) {
        await adminProductsApi.updateProduct({ ...formData, id });
        toast({
          title: 'Success',
          description: 'Product updated successfully',
        });
      } else {
        await adminProductsApi.createProduct(formData);
        toast({
          title: 'Success',
          description: 'Product created successfully',
        });
      }
      navigate('/admin/products');
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${isEdit ? 'update' : 'create'} product`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminHeader />
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${isEdit ? 'Edit' : 'New'} Product - Admin`}
        description={`${isEdit ? 'Edit' : 'Create'} product`}
      />

      <div className="min-h-screen bg-background">
        <AdminHeader />

        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/products')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-2xl">
                {isEdit ? 'Edit Product' : 'New Product'}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Product Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Classic Trench Coat"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">
                      Slug <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="classic-trench-coat"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="Burberry"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price ?? ''}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value ? parseFloat(e.target.value) : null })}
                      placeholder="450.00"
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="outerwear"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="purchaseType">Purchase Type</Label>
                    <Select
                      value={formData.purchaseType || 'affiliate'}
                      onValueChange={(value: 'affiliate' | 'direct') => 
                        setFormData({ ...formData, purchaseType: value })
                      }
                    >
                      <SelectTrigger id="purchaseType">
                        <SelectValue placeholder="Select purchase type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="affiliate">
                          Affiliate Link (Default)
                        </SelectItem>
                        <SelectItem value="direct">
                          Direct Purchase (Contact Mimi)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Affiliate: Show "Shop Now" button with affiliate link<br />
                      Direct: Show "Contact Mimi" button with text/WhatsApp/email options
                    </p>
                  </div>
                </div>

                {apiConfig.enableImageUpload ? (
                  <ImageUploadField
                    id="imageUrl"
                    label="Product Image"
                    value={formData.imageUrl}
                    onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                    required
                    aspectRatio="square"
                    disabled={loading}
                  />
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">
                      Image URL <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="imageUrl"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/photo-..."
                      required
                    />
                    {formData.imageUrl && (
                      <div className="mt-2 aspect-square max-w-[200px] rounded-lg overflow-hidden border">
                        <img
                          src={formData.imageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8';
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="affiliateUrl">
                    Affiliate URL <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="affiliateUrl"
                    value={formData.affiliateUrl}
                    onChange={(e) => setFormData({ ...formData, affiliateUrl: e.target.value })}
                    placeholder="https://nordstrom.com/..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Timeless beige trench coat perfect for all seasons..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      id="tags"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="minimalist"
                    />
                    <Button type="button" variant="secondary" onClick={handleAddTag}>
                      Add
                    </Button>
                  </div>
                  {formData.tags && formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-destructive"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isFeatured: checked as boolean })
                    }
                  />
                  <Label htmlFor="featured" className="cursor-pointer">
                    Feature this product
                  </Label>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {isEdit ? 'Update' : 'Create'} Product
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/admin/products')}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
