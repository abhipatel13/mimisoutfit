/**
 * Admin Retailers Management Page
 * Manage trusted affiliate retailers dynamically
 */

import { useState, useEffect } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Shield, ExternalLink, Search, CheckCircle2, XCircle } from 'lucide-react';
import { SEO } from '@/components/SEO';

interface TrustedRetailer {
  domain: string;
  name: string;
  category: 'luxury' | 'contemporary' | 'fast-fashion' | 'marketplace';
  addedAt: string;
  isActive: boolean;
}

const RETAILER_CATEGORIES = {
  luxury: { label: 'Luxury & Designer', color: 'bg-purple-500' },
  contemporary: { label: 'Contemporary', color: 'bg-blue-500' },
  'fast-fashion': { label: 'Fast Fashion', color: 'bg-green-500' },
  marketplace: { label: 'Marketplace', color: 'bg-orange-500' },
};

// Initial trusted retailers from AffiliateRedirect.tsx
const INITIAL_RETAILERS: TrustedRetailer[] = [
  // Luxury & Designer
  { domain: 'nordstrom.com', name: 'Nordstrom', category: 'luxury', addedAt: '2024-01-01', isActive: true },
  { domain: 'net-a-porter.com', name: 'Net-A-Porter', category: 'luxury', addedAt: '2024-01-01', isActive: true },
  { domain: 'saksfifthavenue.com', name: 'Saks Fifth Avenue', category: 'luxury', addedAt: '2024-01-01', isActive: true },
  { domain: 'bergdorfgoodman.com', name: 'Bergdorf Goodman', category: 'luxury', addedAt: '2024-01-01', isActive: true },
  { domain: 'matchesfashion.com', name: 'Matches Fashion', category: 'luxury', addedAt: '2024-01-01', isActive: true },
  { domain: 'mytheresa.com', name: 'Mytheresa', category: 'luxury', addedAt: '2024-01-01', isActive: true },
  { domain: 'luisaviaroma.com', name: 'Luisa Via Roma', category: 'luxury', addedAt: '2024-01-01', isActive: true },
  { domain: 'farfetch.com', name: 'Farfetch', category: 'luxury', addedAt: '2024-01-01', isActive: true },
  { domain: 'ssense.com', name: 'SSENSE', category: 'luxury', addedAt: '2024-01-01', isActive: true },
  
  // Contemporary
  { domain: 'shopbop.com', name: 'Shopbop', category: 'contemporary', addedAt: '2024-01-01', isActive: true },
  { domain: 'revolve.com', name: 'Revolve', category: 'contemporary', addedAt: '2024-01-01', isActive: true },
  { domain: 'anthropologie.com', name: 'Anthropologie', category: 'contemporary', addedAt: '2024-01-01', isActive: true },
  { domain: 'freepeople.com', name: 'Free People', category: 'contemporary', addedAt: '2024-01-01', isActive: true },
  { domain: 'urbanoutfitters.com', name: 'Urban Outfitters', category: 'contemporary', addedAt: '2024-01-01', isActive: true },
  
  // Fast Fashion
  { domain: 'zara.com', name: 'Zara', category: 'fast-fashion', addedAt: '2024-01-01', isActive: true },
  { domain: 'hm.com', name: 'H&M', category: 'fast-fashion', addedAt: '2024-01-01', isActive: true },
  { domain: 'asos.com', name: 'ASOS', category: 'fast-fashion', addedAt: '2024-01-01', isActive: true },
  { domain: 'mango.com', name: 'Mango', category: 'fast-fashion', addedAt: '2024-01-01', isActive: true },
  { domain: 'stories.com', name: '& Other Stories', category: 'fast-fashion', addedAt: '2024-01-01', isActive: true },
  
  // Marketplaces
  { domain: 'amazon.com', name: 'Amazon', category: 'marketplace', addedAt: '2024-01-01', isActive: true },
  { domain: 'etsy.com', name: 'Etsy', category: 'marketplace', addedAt: '2024-01-01', isActive: true },
  { domain: 'ebay.com', name: 'eBay', category: 'marketplace', addedAt: '2024-01-01', isActive: true },
];

export default function AdminRetailersPage() {
  const [retailers, setRetailers] = useState<TrustedRetailer[]>(INITIAL_RETAILERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [testUrl, setTestUrl] = useState('');
  const [testResult, setTestResult] = useState<{ isValid: boolean; message: string } | null>(null);
  const { toast } = useToast();

  // Add retailer form state
  const [newRetailer, setNewRetailer] = useState({
    domain: '',
    name: '',
    category: 'contemporary' as TrustedRetailer['category'],
  });

  // Load retailers from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('trusted-retailers');
    if (saved) {
      try {
        setRetailers(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load retailers:', error);
      }
    }
  }, []);

  // Save retailers to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('trusted-retailers', JSON.stringify(retailers));
  }, [retailers]);

  const handleAddRetailer = () => {
    const domain = newRetailer.domain.trim().toLowerCase();
    
    // Validation
    if (!domain || !newRetailer.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    // Check for duplicates
    if (retailers.some(r => r.domain === domain)) {
      toast({
        title: 'Duplicate Domain',
        description: 'This retailer already exists',
        variant: 'destructive',
      });
      return;
    }

    // Validate domain format
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) {
      toast({
        title: 'Invalid Domain',
        description: 'Please enter a valid domain (e.g., example.com)',
        variant: 'destructive',
      });
      return;
    }

    const retailer: TrustedRetailer = {
      domain,
      name: newRetailer.name.trim(),
      category: newRetailer.category,
      addedAt: new Date().toISOString(),
      isActive: true,
    };

    setRetailers([...retailers, retailer]);
    setIsAddDialogOpen(false);
    setNewRetailer({ domain: '', name: '', category: 'contemporary' });

    toast({
      title: 'Success',
      description: `${retailer.name} added to trusted retailers`,
    });
  };

  const handleDeleteRetailer = (domain: string) => {
    setRetailers(retailers.filter(r => r.domain !== domain));
    setDeleteConfirm(null);
    
    toast({
      title: 'Success',
      description: 'Retailer removed',
    });
  };

  const handleToggleActive = (domain: string) => {
    setRetailers(retailers.map(r => 
      r.domain === domain ? { ...r, isActive: !r.isActive } : r
    ));
  };

  const testRetailerDomain = (url: string) => {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace(/^www\./, '');
      
      const isValid = retailers.some(r => r.isActive && r.domain === domain);
      
      setTestResult({
        isValid,
        message: isValid 
          ? `✓ Valid - ${retailers.find(r => r.domain === domain)?.name}` 
          : `✗ Not trusted - ${domain}`,
      });
    } catch (error) {
      setTestResult({
        isValid: false,
        message: '✗ Invalid URL format',
      });
    }
  };

  const filteredRetailers = retailers.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: retailers.length,
    active: retailers.filter(r => r.isActive).length,
    byCategory: Object.entries(
      retailers.reduce((acc, r) => {
        acc[r.category] = (acc[r.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ),
  };

  return (
    <>
      <SEO
        title="Manage Retailers - Admin"
        description="Manage trusted affiliate retailers"
      />

      <div className="min-h-screen bg-background">
        <AdminHeader />

        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div>
                <h1 className="font-serif text-3xl font-bold mb-2">
                  <Shield className="inline-block w-8 h-8 mr-2 -mt-1" />
                  Trusted Retailers
                </h1>
                <p className="text-muted-foreground">
                  Manage whitelist for affiliate redirect security
                </p>
              </div>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Retailer
              </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Retailers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                </CardContent>
              </Card>

              {stats.byCategory?.slice(0, 2)?.map(([category, count]) => (
                <Card key={category}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground capitalize">
                      {RETAILER_CATEGORIES[category as keyof typeof RETAILER_CATEGORIES].label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{count}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search retailers by name, domain, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Test URL */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Test Affiliate URL</CardTitle>
                <CardDescription>
                  Check if a URL is from a trusted retailer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Input
                    placeholder="https://www.nordstrom.com/product/..."
                    value={testUrl}
                    onChange={(e) => setTestUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={() => testRetailerDomain(testUrl)} variant="outline">
                    Test URL
                  </Button>
                </div>
                {testResult && (
                  <div className={`mt-3 flex items-center gap-2 text-sm ${
                    testResult.isValid ? 'text-green-600' : 'text-destructive'
                  }`}>
                    {testResult.isValid ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    {testResult.message}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Retailers List */}
          <div className="space-y-3">
            {filteredRetailers.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground mb-4">
                    {searchQuery ? 'No retailers found matching your search' : 'No retailers yet'}
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => setIsAddDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Retailer
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredRetailers.map((retailer) => (
                <Card key={retailer.domain}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`w-2 h-16 rounded-full ${
                        retailer.isActive ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{retailer.name}</h3>
                          <Badge 
                            variant="secondary" 
                            className={`${RETAILER_CATEGORIES[retailer.category].color} text-white text-xs`}
                          >
                            {RETAILER_CATEGORIES[retailer.category].label}
                          </Badge>
                          {!retailer.isActive && (
                            <Badge variant="outline" className="text-xs">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="truncate">{retailer.domain}</span>
                          <a 
                            href={`https://${retailer.domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 hover:text-primary"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant={retailer.isActive ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleToggleActive(retailer.domain)}
                      >
                        {retailer.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteConfirm(retailer.domain)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Retailer Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Trusted Retailer</DialogTitle>
            <DialogDescription>
              Add a new retailer to the whitelist for affiliate redirects
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="retailer-name">Retailer Name *</Label>
              <Input
                id="retailer-name"
                placeholder="Nordstrom"
                value={newRetailer.name}
                onChange={(e) => setNewRetailer({ ...newRetailer, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="retailer-domain">Domain *</Label>
              <Input
                id="retailer-domain"
                placeholder="nordstrom.com"
                value={newRetailer.domain}
                onChange={(e) => setNewRetailer({ ...newRetailer, domain: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Enter domain only (e.g., nordstrom.com, not https://www.nordstrom.com)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="retailer-category">Category *</Label>
              <select
                id="retailer-category"
                className="w-full px-3 py-2 border rounded-md"
                value={newRetailer.category}
                onChange={(e) => setNewRetailer({ 
                  ...newRetailer, 
                  category: e.target.value as TrustedRetailer['category'] 
                })}
              >
                {Object.entries(RETAILER_CATEGORIES).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddRetailer}>
              Add Retailer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove{' '}
              <strong>{retailers.find(r => r.domain === deleteConfirm)?.name}</strong>{' '}
              from the trusted retailers list. Affiliate links from this retailer will be blocked.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDeleteRetailer(deleteConfirm)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
