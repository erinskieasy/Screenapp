import { useState } from "react";
import { useEmailLogs, useEmailLogsByRecipient } from "@/hooks/use-email-campaigns";
import { useEmailCampaigns } from "@/hooks/use-email-campaigns";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, CheckCircle, XCircle, AlertCircle, Clock, Mail } from "lucide-react";

export function EmailLogsTab() {
  const [campaignFilter, setCampaignFilter] = useState<number | undefined>(undefined);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: logsData, isLoading: isLoadingLogs } = useEmailLogs(campaignFilter);
  const { data: searchLogsData, isLoading: isLoadingSearch } = useEmailLogsByRecipient(searchTerm);
  const { data: campaignsData, isLoading: isLoadingCampaigns } = useEmailCampaigns();
  
  const logs = searchTerm 
    ? (searchLogsData?.data?.logs || [])
    : (logsData?.data?.logs || []);
  const campaigns = campaignsData?.data?.campaigns || [];
  
  const handleSearch = () => {
    setSearchTerm(searchEmail);
    setCampaignFilter(undefined);
  };
  
  const clearFilters = () => {
    setSearchTerm("");
    setSearchEmail("");
    setCampaignFilter(undefined);
  };
  
  const isLoading = isLoadingLogs || isLoadingCampaigns || isLoadingSearch;
  
  if (isLoading) {
    return <div className="flex justify-center p-8">Loading email logs...</div>;
  }
  
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'sent':
        return <Mail className="w-4 h-4 text-blue-500" />;
      case 'delivered':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'opened':
      case 'clicked':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'bounced':
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };
  
  const getStatusVariant = (status: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (status.toLowerCase()) {
      case 'sent':
      case 'delivered':
        return 'secondary';
      case 'opened':
      case 'clicked':
        return 'default';
      case 'bounced':
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Email Logs</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={clearFilters}>
            <X className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search by recipient email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            className="max-w-sm"
          />
          <Button variant="secondary" onClick={handleSearch}>
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select 
            value={campaignFilter?.toString() || ""}
            onValueChange={(value) => {
              setCampaignFilter(value ? parseInt(value) : undefined);
              setSearchTerm("");
              setSearchEmail("");
            }}
          >
            <SelectTrigger className="max-w-sm">
              <SelectValue placeholder="Filter by campaign" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Campaigns</SelectItem>
              {campaigns.map((campaign: any) => (
                <SelectItem key={campaign.id} value={campaign.id.toString()}>
                  {campaign.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {logs.length === 0 ? (
        <div className="text-center p-8 bg-muted rounded-md">
          <p>No email logs found. Logs will appear here once emails are sent.</p>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log: any) => {
                const campaign = campaigns.find((c: any) => c.id === log.campaignId);
                
                return (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(log.sentAt).toLocaleString()}
                    </TableCell>
                    <TableCell>{campaign?.name || `Campaign #${log.campaignId}`}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{log.recipientName || "No name"}</span>
                        <span className="text-xs text-muted-foreground">{log.recipientEmail}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(log.status)}
                        <Badge variant={getStatusVariant(log.status)}>
                          {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {log.error || "-"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}