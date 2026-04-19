'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Building2, 
  Calendar, 
  Mail, 
  ExternalLink, 
  Search,
  FileText,
  Twitter,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  MoreHorizontal,
  DollarSign,
  Briefcase,
  Globe
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface PartnershipInquiry {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company_name: string;
  contact_role: string | null;
  company_size: string | null;
  website_url: string;
  twitter_username: string | null;
  telegram_username: string;
  media_interest: string[] | null;
  company_description: string;
  campaign_description: string;
  offerings_interested: string[] | null;
  budget: string;
  timeline: string;
  industry: string;
  status: 'new' | 'contacted' | 'closed';
  created_at: string;
}

export default function PartnershipInquiriesAdmin({ session }: { session: any }) {
  const [inquiries, setInquiries] = useState<PartnershipInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState<PartnershipInquiry | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    if (session) {
      fetchInquiries();
    }
  }, [session, statusFilter]);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('partnership_inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setInquiries(data || []);
    } catch (error) {
      console.error('Error fetching partnership inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('partnership_inquiries')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setInquiries(inquiries.map(inq => 
        inq.id === id ? { ...inq, status: newStatus as any } : inq
      ));
      
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry({ ...selectedInquiry, status: newStatus as any });
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const filteredInquiries = inquiries.filter(inq => {
    const searchLower = searchQuery.toLowerCase();
    return (
      inq.company_name.toLowerCase().includes(searchLower) ||
      inq.email.toLowerCase().includes(searchLower) ||
      inq.first_name.toLowerCase().includes(searchLower) ||
      inq.last_name.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-blue-500 hover:bg-blue-600">New</Badge>;
      case 'contacted':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Contacted</Badge>;
      case 'closed':
        return <Badge className="bg-green-500 hover:bg-green-600">Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Partnership Inquiries</h2>
          <p className="text-muted-foreground">Manage incoming partnership requests and leads.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="h-8 px-3">
            Total: {inquiries.length}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search companies..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Loading inquiries...
                    </TableCell>
                  </TableRow>
                ) : filteredInquiries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No inquiries found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInquiries.map((inq) => (
                    <TableRow key={inq.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{inq.company_name}</span>
                          <a 
                            href={inq.website_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground hover:underline flex items-center gap-1"
                          >
                            {new URL(inq.website_url).hostname} <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{inq.first_name} {inq.last_name}</span>
                          <span className="text-xs text-muted-foreground">{inq.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>{inq.budget}</TableCell>
                      <TableCell>{formatDate(inq.created_at)}</TableCell>
                      <TableCell>{getStatusBadge(inq.status)}</TableCell>
                      <TableCell className="text-right">
                        <Sheet open={isSheetOpen && selectedInquiry?.id === inq.id} onOpenChange={(open) => {
                          setIsSheetOpen(open);
                          if (open) setSelectedInquiry(inq);
                          else setSelectedInquiry(null);
                        }}>
                          <SheetTrigger asChild>
                            <Button variant="ghost" size="sm">View Details</Button>
                          </SheetTrigger>
                          <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                            <SheetHeader>
                              <SheetTitle>Partnership Details</SheetTitle>
                              <SheetDescription>
                                Inquiry from {inq.company_name}
                              </SheetDescription>
                            </SheetHeader>
                            
                            {selectedInquiry && (
                              <div className="mt-6 space-y-6">
                                {/* Status Control */}
                                <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
                                  <span className="text-sm font-medium">Current Status</span>
                                  <Select 
                                    value={selectedInquiry.status} 
                                    onValueChange={(val) => updateStatus(selectedInquiry.id, val)}
                                  >
                                    <SelectTrigger className="w-[140px]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="new">New</SelectItem>
                                      <SelectItem value="contacted">Contacted</SelectItem>
                                      <SelectItem value="closed">Closed</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <Separator />

                                {/* Contact Info */}
                                <div>
                                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                                    <Mail className="h-4 w-4" /> Contact Information
                                  </h3>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-muted-foreground block">Name</span>
                                      <span>{selectedInquiry.first_name} {selectedInquiry.last_name}</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground block">Email</span>
                                      <a href={`mailto:${selectedInquiry.email}`} className="text-blue-500 hover:underline">
                                        {selectedInquiry.email}
                                      </a>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground block">Role</span>
                                      <span>{selectedInquiry.contact_role || '-'}</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground block">Telegram</span>
                                      <a 
                                        href={`https://t.me/${selectedInquiry.telegram_username.replace('@', '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:underline flex items-center gap-1"
                                      >
                                        {selectedInquiry.telegram_username} <ExternalLink className="h-3 w-3" />
                                      </a>
                                    </div>
                                    {selectedInquiry.twitter_username && (
                                      <div className="col-span-2">
                                        <span className="text-muted-foreground block">Twitter</span>
                                        <a 
                                          href={`https://twitter.com/${selectedInquiry.twitter_username.replace('@', '')}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-500 hover:underline flex items-center gap-1"
                                        >
                                          {selectedInquiry.twitter_username} <ExternalLink className="h-3 w-3" />
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <Separator />

                                {/* Company Info */}
                                <div>
                                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                                    <Building2 className="h-4 w-4" /> Company Details
                                  </h3>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-muted-foreground block">Company Name</span>
                                      <span>{selectedInquiry.company_name}</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground block">Size</span>
                                      <span>{selectedInquiry.company_size || '-'}</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground block">Industry</span>
                                      <span>{selectedInquiry.industry}</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground block">Website</span>
                                      <a 
                                        href={selectedInquiry.website_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:underline flex items-center gap-1"
                                      >
                                        Visit Site <ExternalLink className="h-3 w-3" />
                                      </a>
                                    </div>
                                    <div className="col-span-2">
                                      <span className="text-muted-foreground block mb-1">Description</span>
                                      <p className="text-muted-foreground bg-muted/30 p-3 rounded-md text-xs leading-relaxed">
                                        {selectedInquiry.company_description}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <Separator />

                                {/* Campaign Details */}
                                <div>
                                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                                    <Briefcase className="h-4 w-4" /> Campaign Details
                                  </h3>
                                  <div className="space-y-4 text-sm">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <span className="text-muted-foreground block">Budget</span>
                                        <span className="font-medium text-green-600">{selectedInquiry.budget}</span>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground block">Timeline</span>
                                        <span>{selectedInquiry.timeline}</span>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <span className="text-muted-foreground block mb-2">Interested Offerings</span>
                                      <div className="flex flex-wrap gap-2">
                                        {selectedInquiry.offerings_interested?.map((offering, i) => (
                                          <Badge key={i} variant="secondary">{offering}</Badge>
                                        ))}
                                      </div>
                                    </div>

                                    <div>
                                      <span className="text-muted-foreground block mb-2">Media Interest</span>
                                      <div className="flex flex-wrap gap-2">
                                        {selectedInquiry.media_interest?.map((media, i) => (
                                          <Badge key={i} variant="outline">{media}</Badge>
                                        ))}
                                      </div>
                                    </div>

                                    <div>
                                      <span className="text-muted-foreground block mb-1">Campaign Description</span>
                                      <p className="text-muted-foreground bg-muted/30 p-3 rounded-md text-xs leading-relaxed">
                                        {selectedInquiry.campaign_description}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                              </div>
                            )}
                          </SheetContent>
                        </Sheet>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
