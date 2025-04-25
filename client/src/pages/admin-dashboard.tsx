import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { AdminNavbar } from "@/components/admin-navbar";
import { useToast } from "@/hooks/use-toast";
import { useAllParishes } from "@/hooks/use-parishes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  LogOut,
  Save,
  Download,
  Upload,
  Loader2,
  Link as LinkIcon,
  Globe,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

export default function AdminDashboard() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("hero");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [darkLogoFile, setDarkLogoFile] = useState<File | null>(null);
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [siteName, setSiteName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [darkLogoUrl, setDarkLogoUrl] = useState("");
  const [heroBackgroundUrl, setHeroBackgroundUrl] = useState("");
  const [isHeroBackgroundVideo, setIsHeroBackgroundVideo] = useState(false);
  const [newParishName, setNewParishName] = useState("");
  const [editingParishId, setEditingParishId] = useState<number | null>(null);
  const [editingParishName, setEditingParishName] = useState("");
  const [socialLinks, setSocialLinks] = useState([
    { platform: "linkedin", url: "", icon: "SiLinkedin" },
    { platform: "twitter", url: "", icon: "SiTwitter" },
    { platform: "facebook", url: "", icon: "SiFacebook" },
    { platform: "instagram", url: "", icon: "SiInstagram" },
  ]);

  // Fetch site settings
  const { data: siteSettings, isLoading: isLoadingSettings } = useQuery<any>({
    queryKey: ["/api/settings"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Effect to update state when settings data is loaded
  useEffect(() => {
    if (siteSettings?.success && siteSettings.settings) {
      setHeroTitle(siteSettings.settings.heroTitle || "");
      setHeroSubtitle(siteSettings.settings.heroSubtitle || "");
      setSiteName(siteSettings.settings.siteName || "");
      setLogoUrl(siteSettings.settings.siteLogo || "");
      setDarkLogoUrl(siteSettings.settings.darkSiteLogo || "");
      
      // Set hero background image/video URL
      const bgUrl = siteSettings.settings.heroBackgroundImage || "";
      setHeroBackgroundUrl(bgUrl);
      
      // Determine if it's a video based on file extension
      if (bgUrl) {
        const extension = bgUrl.split('.').pop()?.toLowerCase();
        setIsHeroBackgroundVideo(
          extension === 'mp4' || 
          extension === 'webm' || 
          extension === 'mov' || 
          extension === 'ogg'
        );
      }
    }
  }, [siteSettings]);

  // Fetch social links
  const { data: socialLinksData, isLoading: isLoadingSocialLinks } = useQuery<any>({
    queryKey: ["/api/social-links"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Effect to update state when social links data is loaded
  useEffect(() => {
    if (socialLinksData?.success && socialLinksData.links) {
      const fetchedLinks = socialLinksData.links;
      setSocialLinks((prevLinks) => {
        return prevLinks.map((link) => {
          const fetchedLink = fetchedLinks.find(
            (fl: any) => fl.platform === link.platform
          );
          return fetchedLink
            ? { ...link, url: fetchedLink.url }
            : link;
        });
      });
    }
  }, [socialLinksData]);

  // Fetch waitlist entries
  const { data: waitlistData, isLoading: isLoadingWaitlist } = useQuery<any>({
    queryKey: ["/api/waitlist"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  // Fetch parishes
  const { data: parishesData, isLoading: isLoadingParishes } = useAllParishes();

  // Update site setting mutation
  const updateSettingMutation = useMutation({
    mutationFn: async ({
      key,
      value,
    }: {
      key: string;
      value: string;
    }) => {
      const res = await apiRequest("POST", "/api/settings", { key, value });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Setting updated",
        description: "The setting has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update social link mutation
  const updateSocialLinkMutation = useMutation({
    mutationFn: async ({
      platform,
      url,
      icon,
    }: {
      platform: string;
      url: string;
      icon: string;
    }) => {
      const res = await apiRequest("POST", "/api/social-links", {
        platform,
        url,
        icon,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social-links"] });
      toast({
        title: "Social link updated",
        description: "The social link has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Upload hero background image mutation
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/upload/hero-background", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to upload image");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      setImageFile(null);
      toast({
        title: "Image uploaded",
        description: "The hero background image has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Upload site logo mutation
  const uploadLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/upload/site-logo", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to upload logo");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      setLogoFile(null);
      toast({
        title: "Logo uploaded",
        description: "The site logo has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Upload dark mode site logo mutation
  const uploadDarkLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/upload/dark-site-logo", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to upload dark mode logo");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      setDarkLogoFile(null);
      toast({
        title: "Dark mode logo uploaded",
        description: "The dark mode site logo has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSaveSetting = (key: string, value: string) => {
    updateSettingMutation.mutate({ key, value });
  };

  const handleSaveSocialLink = (platform: string, url: string, icon: string) => {
    updateSocialLinkMutation.mutate({ platform, url, icon });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImageFile(event.target.files[0]);
    }
  };

  const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setLogoFile(event.target.files[0]);
    }
  };
  
  const handleDarkLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setDarkLogoFile(event.target.files[0]);
    }
  };

  const handleUploadImage = () => {
    if (imageFile) {
      uploadImageMutation.mutate(imageFile);
    }
  };
  
  const handleUploadLogo = () => {
    if (logoFile) {
      uploadLogoMutation.mutate(logoFile);
    }
  };
  
  const handleUploadDarkLogo = () => {
    if (darkLogoFile) {
      uploadDarkLogoMutation.mutate(darkLogoFile);
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleUpdateHeroTitle = () => {
    handleSaveSetting("heroTitle", heroTitle);
  };

  const handleUpdateHeroSubtitle = () => {
    handleSaveSetting("heroSubtitle", heroSubtitle);
  };

  const handleUpdateSiteName = () => {
    handleSaveSetting("siteName", siteName);
  };

  const handleSocialLinkChange = (platform: string, url: string) => {
    setSocialLinks((prevLinks) => {
      return prevLinks.map((link) => {
        if (link.platform === platform) {
          return { ...link, url };
        }
        return link;
      });
    });
  };

  const handleSaveSocialLinks = () => {
    socialLinks.forEach((link) => {
      if (link.url) {
        handleSaveSocialLink(link.platform, link.url, link.icon);
      }
    });
  };

  // Create parish mutation
  const createParishMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest("POST", "/api/parishes", { name });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parishes/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/parishes"] });
      setNewParishName("");
      toast({
        title: "Parish created",
        description: "The parish has been created successfully."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Creation failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Update parish mutation
  const updateParishMutation = useMutation({
    mutationFn: async ({ id, name, active }: { id: number, name?: string, active?: boolean }) => {
      const res = await apiRequest("PUT", `/api/parishes/${id}`, { name, active });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parishes/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/parishes"] });
      setEditingParishId(null);
      setEditingParishName("");
      toast({
        title: "Parish updated",
        description: "The parish has been updated successfully."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Delete parish mutation
  const deleteParishMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/parishes/${id}`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parishes/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/parishes"] });
      toast({
        title: "Parish deleted",
        description: "The parish has been deleted successfully."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Deletion failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const handleCreateParish = () => {
    if (newParishName.trim()) {
      createParishMutation.mutate(newParishName);
    }
  };
  
  const handleStartEditParish = (parish: any) => {
    setEditingParishId(parish.id);
    setEditingParishName(parish.name);
  };
  
  const handleUpdateParish = () => {
    if (editingParishId && editingParishName.trim()) {
      updateParishMutation.mutate({ id: editingParishId, name: editingParishName });
    }
  };
  
  const handleCancelEdit = () => {
    setEditingParishId(null);
    setEditingParishName("");
  };
  
  const handleToggleParishActive = (parish: any) => {
    updateParishMutation.mutate({ id: parish.id, active: !parish.active });
  };
  
  const handleDeleteParish = (id: number) => {
    if (confirm("Are you sure you want to delete this parish?")) {
      deleteParishMutation.mutate(id);
    }
  };

  const isLoading =
    isLoadingSettings || isLoadingSocialLinks || isLoadingWaitlist || isLoadingParishes;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <>
      <AdminNavbar />
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="hero">Hero Section</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="footer">Footer & Social</TabsTrigger>
          <TabsTrigger value="parishes">Parishes</TabsTrigger>
          <TabsTrigger value="waitlist">Waitlist Entries</TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
              <CardDescription>
                Customize the main section of your landing page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="heroTitle">Hero Title</Label>
                <Input
                  id="heroTitle"
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  placeholder="Find the Job That Finds You"
                />
                <Button 
                  variant="outline" 
                  onClick={handleUpdateHeroTitle}
                  disabled={updateSettingMutation.isPending}
                >
                  {updateSettingMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Title
                </Button>
              </div>

              <div className="space-y-2 pt-4">
                <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                <Textarea
                  id="heroSubtitle"
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  placeholder="Our AI algorithm matches you with recruiters looking for your exact skills and experience."
                  rows={5}
                />
                <div className="text-xs text-muted-foreground mt-1">
                  Supports Markdown formatting. Use line breaks for paragraphs, *asterisks* for italics, **double asterisks** for bold, and - for bullet points.
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleUpdateHeroSubtitle}
                  disabled={updateSettingMutation.isPending}
                >
                  {updateSettingMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Subtitle
                </Button>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 pt-4">
                <Label htmlFor="heroImage">Hero Background Media (Image or Video)</Label>
                
                {/* Preview current hero background */}
                {heroBackgroundUrl && (
                  <div className="mb-4 p-4 border rounded-md bg-neutral-50 dark:bg-gray-800">
                    <div className="text-sm font-medium mb-2">Current Hero Background:</div>
                    <div className="flex flex-col items-start space-y-2">
                      {/* Display the appropriate preview based on file extension */}
                      {isHeroBackgroundVideo ? (
                        <div className="w-full max-w-md bg-black rounded-md overflow-hidden shadow-sm">
                          <video 
                            src={`/image/${heroBackgroundUrl}`}
                            className="w-full h-auto max-h-48 object-cover"
                            controls
                            muted
                          />
                        </div>
                      ) : (
                        <div className="w-full max-w-md bg-gray-100 dark:bg-gray-900 rounded-md overflow-hidden shadow-sm">
                          <img 
                            src={`/image/${heroBackgroundUrl}`}
                            alt="Current Hero Background" 
                            className="w-full h-auto max-h-48 object-cover" 
                          />
                        </div>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {heroBackgroundUrl.split('/').pop()}
                      </span>
                    </div>
                  </div>
                )}
                
                <Input
                  id="heroImage"
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                />
                <div className="text-sm text-muted-foreground mb-2 flex items-center">
                  <span>You can upload an image (.jpg, .png, .gif) or video file (.mp4, .webm, .mov). Videos should be less than 50MB and ideally 10-30 seconds long.</span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-slate-900 border border-gray-300 dark:border-gray-600 shadow-sm"></div>
                  <span className="text-sm text-muted-foreground">Background color shown during media loading</span>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleUploadImage}
                  disabled={!imageFile || uploadImageMutation.isPending}
                >
                  {uploadImageMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Upload Media
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Site Branding</CardTitle>
              <CardDescription>
                Update your site name and branding elements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="TalentMatch AI"
                />
                <Button 
                  variant="outline" 
                  onClick={handleUpdateSiteName}
                  disabled={updateSettingMutation.isPending}
                >
                  {updateSettingMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Site Name
                </Button>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2 pt-4">
                <Label htmlFor="siteLogo">Light Mode Logo</Label>
                
                {logoUrl && (
                  <div className="mb-4 p-4 border rounded-md bg-neutral-50 dark:bg-gray-800">
                    <div className="text-sm font-medium mb-2">Current Light Mode Logo:</div>
                    <div className="flex items-center space-x-2">
                      <div className="bg-white p-2 rounded-md border shadow-sm">
                        <img 
                          src={`/image/${logoUrl}`} 
                          alt="Site Logo" 
                          className="h-10 object-contain" 
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {logoUrl.split('/').pop()}
                      </span>
                    </div>
                  </div>
                )}
                
                <Input
                  id="siteLogo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFileChange}
                />
                <div className="text-sm text-muted-foreground mb-2">
                  Upload a logo image for light mode. Recommended size: 40px height.
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleUploadLogo}
                  disabled={!logoFile || uploadLogoMutation.isPending}
                >
                  {uploadLogoMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Upload Light Mode Logo
                </Button>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2 pt-4">
                <Label htmlFor="darkSiteLogo">Dark Mode Logo</Label>
                
                {darkLogoUrl && (
                  <div className="mb-4 p-4 border rounded-md bg-neutral-50 dark:bg-gray-800">
                    <div className="text-sm font-medium mb-2">Current Dark Mode Logo:</div>
                    <div className="flex items-center space-x-2">
                      <div className="bg-gray-800 p-2 rounded-md border shadow-sm">
                        <img 
                          src={`/image/${darkLogoUrl}`} 
                          alt="Dark Mode Site Logo" 
                          className="h-10 object-contain" 
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {darkLogoUrl.split('/').pop()}
                      </span>
                    </div>
                  </div>
                )}
                
                <Input
                  id="darkSiteLogo"
                  type="file"
                  accept="image/*"
                  onChange={handleDarkLogoFileChange}
                />
                <div className="text-sm text-muted-foreground mb-2">
                  Upload a logo image for dark mode. Recommended size: 40px height.
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleUploadDarkLogo}
                  disabled={!darkLogoFile || uploadDarkLogoMutation.isPending}
                >
                  {uploadDarkLogoMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Upload Dark Mode Logo
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="footer" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Footer & Social Links</CardTitle>
              <CardDescription>
                Update your social media links and footer information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {socialLinks.map((link) => (
                  <div key={link.platform} className="space-y-2">
                    <Label htmlFor={`social-${link.platform}`} className="capitalize">
                      {link.platform}
                    </Label>
                    <div className="flex space-x-2">
                      <div className="flex-grow">
                        <Input
                          id={`social-${link.platform}`}
                          value={link.url}
                          onChange={(e) =>
                            handleSocialLinkChange(link.platform, e.target.value)
                          }
                          placeholder={`https://www.${link.platform}.com/yourusername`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  onClick={handleSaveSocialLinks}
                  disabled={updateSocialLinkMutation.isPending}
                >
                  {updateSocialLinkMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Save Social Links
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parishes" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Parishes</CardTitle>
              <CardDescription>
                Manage the list of parishes available in the waitlist form
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-grow">
                    <Input
                      placeholder="Enter new parish name"
                      value={newParishName}
                      onChange={(e) => setNewParishName(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleCreateParish}
                    disabled={!newParishName.trim() || createParishMutation.isPending}
                  >
                    {createParishMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Add Parish
                  </Button>
                </div>
                
                <Separator className="my-4" />
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Parish Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parishesData?.parishes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                            No parishes found. Add your first parish above.
                          </TableCell>
                        </TableRow>
                      ) : (
                        parishesData?.parishes.map((parish: any) => (
                          <TableRow key={parish.id}>
                            <TableCell>
                              {editingParishId === parish.id ? (
                                <Input
                                  value={editingParishName}
                                  onChange={(e) => setEditingParishName(e.target.value)}
                                  placeholder="Parish name"
                                />
                              ) : (
                                parish.name
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleParishActive(parish)}
                                title={parish.active ? "Parish is active. Click to disable." : "Parish is inactive. Click to enable."}
                                className={parish.active ? "text-green-500" : "text-gray-400"}
                              >
                                {parish.active ? (
                                  <ToggleRight className="h-5 w-5" />
                                ) : (
                                  <ToggleLeft className="h-5 w-5" />
                                )}
                                <span className="ml-2">{parish.active ? "Active" : "Inactive"}</span>
                              </Button>
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              {editingParishId === parish.id ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleUpdateParish}
                                    disabled={!editingParishName.trim() || updateParishMutation.isPending}
                                  >
                                    {updateParishMutation.isPending ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Check className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleCancelEdit}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleStartEditParish(parish)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => handleDeleteParish(parish.id)}
                                    disabled={deleteParishMutation.isPending}
                                  >
                                    {deleteParishMutation.isPending && deleteParishMutation.variables === parish.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </Button>
                                </>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p>
                    Active parishes will appear in the dropdown on the waitlist form. Inactive parishes will not be shown.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="waitlist" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Waitlist Entries</CardTitle>
              <CardDescription>
                View and download a list of all waitlist sign-ups
              </CardDescription>
            </CardHeader>
            <CardContent>
              {waitlistData?.entries?.length > 0 ? (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableCaption>
                        A list of all people who signed up for the waitlist.
                      </TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Parish</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {waitlistData.entries.map((entry: any) => (
                          <TableRow key={entry.id}>
                            <TableCell>{entry.fullName}</TableCell>
                            <TableCell>{entry.email}</TableCell>
                            <TableCell>{entry.phone || "-"}</TableCell>
                            <TableCell>{entry.parish || "-"}</TableCell>
                            <TableCell>{entry.role}</TableCell>
                            <TableCell>
                              {new Date(entry.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      window.location.href = "/api/waitlist/download";
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download CSV
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No waitlist entries yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </>
  );
}