import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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

  const isLoading =
    isLoadingSettings || isLoadingSocialLinks || isLoadingWaitlist;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="hero">Hero Section</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="footer">Footer & Social</TabsTrigger>
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
                  rows={3}
                />
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
                <Label htmlFor="heroImage">Hero Background Image</Label>
                <Input
                  id="heroImage"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
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
                  Upload Image
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
  );
}