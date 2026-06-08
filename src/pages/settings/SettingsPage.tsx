import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useSettings, useUpdateSettings } from '@/hooks/useSettings';
import { Skeleton } from '@/components/ui/skeleton';
import { Save, Loader2, Settings, Mail, Globe, Share2 } from 'lucide-react';
import type { PlatformSettings } from '@/types/database';

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();

  // General settings state
  const [siteName, setSiteName] = useState('');
  const [siteDescription, setSiteDescription] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#6366f1');

  // Contact settings state
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [address, setAddress] = useState('');

  // Social settings state
  const [facebookUrl, setFacebookUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [lineUrl, setLineUrl] = useState('');

  useEffect(() => {
    if (settings) {
      setSiteName(settings.site_name || '');
      setSiteDescription(settings.site_description || '');
      setPrimaryColor(settings.primary_color || '#6366f1');
      setContactEmail(settings.contact_email || '');
      setContactPhone(settings.contact_phone || '');
      setAddress(settings.address || '');
      setFacebookUrl(settings.facebook_url || '');
      setTwitterUrl(settings.twitter_url || '');
      setInstagramUrl(settings.instagram_url || '');
      setYoutubeUrl(settings.youtube_url || '');
      setLinkedinUrl(settings.linkedin_url || '');
      setLineUrl(settings.line_url || '');
    }
  }, [settings]);

  const handleSave = () => {
    const data: Partial<PlatformSettings> = {
      site_name: siteName,
      site_description: siteDescription,
      primary_color: primaryColor,
      contact_email: contactEmail,
      contact_phone: contactPhone || null,
      address: address || null,
      facebook_url: facebookUrl || null,
      twitter_url: twitterUrl || null,
      instagram_url: instagramUrl || null,
      youtube_url: youtubeUrl || null,
      linkedin_url: linkedinUrl || null,
      line_url: lineUrl || null,
    };
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-4xl">
        <PageHeader title="Platform Settings" description="Configure LearnHub system preferences" />
        <Card>
          <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <PageHeader
        title="Platform Settings"
        description="Manage site configurations, support details, and social integrations"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Settings' }]}
        actions={
          <Button onClick={handleSave} disabled={updateMutation.isPending} className="shadow-md">
            {updateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save All Changes
          </Button>
        }
      />

      <Tabs defaultValue="general" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" /> General
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <Mail className="h-4 w-4" /> Contact & Support
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" /> Social Networks
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" /> General Configurations
              </CardTitle>
              <CardDescription>Configure branding, site information, and themes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="site_name">Platform Name *</Label>
                  <Input
                    id="site_name"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="e.g. LearnHub Academy"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primary_color">Primary Theme Color</Label>
                  <div className="flex gap-3 items-center">
                    <Input
                      id="primary_color"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-12 h-10 p-0 border rounded-lg cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      placeholder="#6366f1"
                      className="font-mono text-sm max-w-[120px]"
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="site_description">Platform Description</Label>
                  <Textarea
                    id="site_description"
                    value={siteDescription}
                    onChange={(e) => setSiteDescription(e.target.value)}
                    placeholder="Brief platform overview for search engines..."
                    rows={4}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact & Support Settings */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" /> Support & Contact Details
              </CardTitle>
              <CardDescription>This information will be displayed on student invoices and support pages.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Support Email *</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="support@learnhub.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Support Hotline</Label>
                  <Input
                    id="contact_phone"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+66 2 xxx xxxx"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Office Address</Label>
                  <Textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Full physical headquarters address..."
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Settings */}
        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Share2 className="h-5 w-5 text-primary" /> Social Media & Integrations
              </CardTitle>
              <CardDescription>Social links used in page footers and communication emails.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Facebook URL</Label>
                  <Input
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Twitter / X URL</Label>
                  <Input
                    value={twitterUrl}
                    onChange={(e) => setTwitterUrl(e.target.value)}
                    placeholder="https://x.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Instagram URL</Label>
                  <Input
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>YouTube Channel URL</Label>
                  <Input
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://youtube.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>LinkedIn Organization URL</Label>
                  <Input
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/company/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Line Official Account Link</Label>
                  <Input
                    value={lineUrl}
                    onChange={(e) => setLineUrl(e.target.value)}
                    placeholder="https://line.me/R/ti/p/..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
