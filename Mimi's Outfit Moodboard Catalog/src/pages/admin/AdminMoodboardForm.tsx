/**
 * Admin Moodboard Form
 * Create and edit moodboards with product selection
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
import { useToast } from '@/hooks/use-toast';
import { productsApi } from '@/services/api/products.api';
import { moodboardsApi } from '@/services/api/moodboards.api';
import { adminMoodboardsApi } from '@/services/api/admin.api';
import type { CreateMoodboardDto } from '@/types/admin.types';
import type { Product } from '@/types';
import { Save, Loader2, ArrowLeft, X, Search } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { ImageUploadField } from '@/components/admin/ImageUploadField';
import { apiConfig } from '@/config/api.config';

export default function AdminMoodboardForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');

  const [formData, setFormData] = useState<CreateMoodboardDto>({
    title: '',
    slug: '',
    description: '',
    coverImage: '',
    coverBlurhash: undefined,
    productIds: [],
    tags: [],
    isFeatured: false,
    stylingTips: [],
    howToWear: '',
  });

  const [tagInput, setTagInput] = useState('');
  const [tipInput, setTipInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    loadProducts();
    if (isEdit && id) {
      loadMoodboard(id);
    }
  }, [id, isEdit]);

  const loadProducts = async () => {
    try {
      const response = await productsApi.getAllProducts({ limit: 1000 });
      setAllProducts(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load products',
        variant: 'destructive',
      });
    }
  };

  const loadMoodboard = async (moodboardId: string) => {
    try {
      setInitialLoading(true);
      const moodboard = await moodboardsApi.getMoodboardById(moodboardId);
      if (moodboard) {
        setFormData({
          title: moodboard.title,
          slug: moodboard.slug,
          description: moodboard.description || '',
          coverImage: moodboard.coverImage,
          productIds: moodboard.products?.map(p => p.id) || [],
          tags: moodboard.tags || [],
          isFeatured: moodboard.isFeatured || false,
          stylingTips: moodboard.stylingTips || [],
          howToWear: moodboard.howToWear || '',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load moodboard',
        variant: 'destructive',
      });
      navigate('/admin/moodboards');
    } finally {
      setInitialLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData({ ...formData, title });
    if (!isEdit) {
      setFormData(prev => ({ ...prev, title, slug: generateSlug(title) }));
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

  const handleAddTip = () => {
    const tip = tipInput.trim();
    if (tip) {
      setFormData({
        ...formData,
        stylingTips: [...(formData.stylingTips || []), tip],
      });
      setTipInput('');
    }
  };

  const handleRemoveTip = (index: number) => {
    setFormData({
      ...formData,
      stylingTips: formData.stylingTips?.filter((_, i) => i !== index) || [],
    });
  };

  const toggleProduct = (productId: string) => {
    const isSelected = formData.productIds.includes(productId);
    setFormData({
      ...formData,
      productIds: isSelected
        ? formData.productIds.filter(id => id !== productId)
        : [...formData.productIds, productId],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.slug || !formData.coverImage) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (formData.productIds.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select at least one product',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      if (isEdit && id) {
        await adminMoodboardsApi.updateMoodboard({ ...formData, id });
        toast({
          title: 'Success',
          description: 'Moodboard updated successfully',
        });
      } else {
        await adminMoodboardsApi.createMoodboard(formData);
        toast({
          title: 'Success',
          description: 'Moodboard created successfully',
        });
      }
      navigate('/admin/moodboards');
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${isEdit ? 'update' : 'create'} moodboard`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = allProducts.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.brand?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const selectedProducts = allProducts.filter(p => formData.productIds.includes(p.id));

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
        title={`${isEdit ? 'Edit' : 'New'} Moodboard - Admin`}
        description={`${isEdit ? 'Edit' : 'Create'} moodboard`}
      />

      <div className="min-h-screen bg-background">
        <AdminHeader />

        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/moodboards')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Moodboards
          </Button>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Column: Form Fields */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-2xl">
                  {isEdit ? 'Edit Moodboard' : 'New Moodboard'}
                </CardTitle>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">
                      Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="Parisian Chic"
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
                      placeholder="parisian-chic"
                      required
                    />
                  </div>

                  {apiConfig.enableImageUpload ? (
                    <ImageUploadField
                      id="coverImage"
                      label="Cover Image"
                      value={formData.coverImage}
                      onChange={(url) => setFormData({ ...formData, coverImage: url })}
                      required
                      aspectRatio="4/3"
                      disabled={loading}
                    />
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="coverImage">
                        Cover Image URL <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="coverImage"
                        value={formData.coverImage}
                        onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                        placeholder="https://images.unsplash.com/photo-..."
                        required
                      />
                      {formData.coverImage && (
                        <div className="mt-2 aspect-[4/3] rounded-lg overflow-hidden border">
                          <img
                            src={formData.coverImage}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Effortlessly chic French-inspired looks..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="howToWear">How to Wear</Label>
                    <Textarea
                      id="howToWear"
                      value={formData.howToWear}
                      onChange={(e) => setFormData({ ...formData, howToWear: e.target.value })}
                      placeholder="Perfect for transitional weather..."
                      rows={3}
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
                        placeholder="french"
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

                  <div className="space-y-2">
                    <Label htmlFor="tips">Styling Tips</Label>
                    <div className="flex gap-2">
                      <Input
                        id="tips"
                        value={tipInput}
                        onChange={(e) => setTipInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTip();
                          }
                        }}
                        placeholder="Pair with classic pumps"
                      />
                      <Button type="button" variant="secondary" onClick={handleAddTip}>
                        Add
                      </Button>
                    </div>
                    {formData.stylingTips && formData.stylingTips.length > 0 && (
                      <ul className="space-y-2 mt-2">
                        {formData.stylingTips.map((tip, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 p-2 bg-secondary/50 rounded text-sm"
                          >
                            <span className="flex-1">{tip}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTip(index)}
                              className="text-destructive hover:text-destructive/80"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
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
                      Feature this moodboard
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
                          {isEdit ? 'Update' : 'Create'} Moodboard
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/admin/moodboards')}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Right Column: Product Selection */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Selected Products ({formData.productIds.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedProducts.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No products selected yet
                    </p>
                  ) : (
                    <div className="grid gap-3 max-h-[300px] overflow-y-auto">
                      {selectedProducts.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center gap-3 p-2 border rounded-lg"
                        >
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{product.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{product.brand}</p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleProduct(product.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Add Products</CardTitle>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 max-h-[400px] overflow-y-auto">
                    {filteredProducts
                      ?.filter(p => !formData.productIds.includes(p.id))
                      ?.slice(0, 20)
                      ?.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center gap-3 p-2 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                          onClick={() => toggleProduct(product.id)}
                        >
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{product.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{product.brand}</p>
                            <p className="text-xs font-semibold mt-1">${product.price?.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
