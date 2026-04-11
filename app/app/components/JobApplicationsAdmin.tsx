'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Briefcase, 
  Calendar, 
  Mail, 
  Phone, 
  ExternalLink, 
  Search,
  FileText,
  Linkedin,
  Globe,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  MoreHorizontal,
  Download
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

interface JobApplication {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  linkedin: string | null;
  portfolio: string | null;
  resume_link: string;
  cover_letter: string | null;
  position_title: string;
  position_slug: string;
  status: 'new' | 'reviewed' | 'shortlisted' | 'rejected';
  created_at: string;
}

export default function JobApplicationsAdmin({ session }: { session: any }) {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    if (session) {
      fetchApplications();
    }
  }, [session, statusFilter, positionFilter]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('job_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (positionFilter !== 'all') {
        query = query.eq('position_slug', positionFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setApplications(data || []);
    } catch (error: any) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      // Optimistic update
      setApplications(apps => apps.map(app => 
        app.id === id ? { ...app, status: newStatus as any } : app
      ));
      
      if (selectedApplication?.id === id) {
        setSelectedApplication({ ...selectedApplication, status: newStatus as any });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">New</Badge>;
      case 'reviewed':
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">Reviewed</Badge>;
      case 'shortlisted':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Shortlisted</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const filteredApplications = applications.filter(app => 
    app.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const uniquePositions = Array.from(new Set(applications.map(app => app.position_slug)));

  const handleViewDetails = (app: JobApplication) => {
    setSelectedApplication(app);
    setIsSheetOpen(true);
  };

  return (
    <div className="space-y-6 p-1">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Job Applications</h2>
          <p className="text-muted-foreground">
            Manage and review incoming job applications.
          </p>
        </div>
        <div className="flex items-center gap-2">
           <Badge variant="outline" className="h-8 px-3 text-sm">
            Total: {applications.length}
          </Badge>
        </div>
      </div>

      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-lg font-medium">Applications</CardTitle>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search applicants..."
                  className="pl-8 bg-zinc-950/50 border-zinc-800"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px] bg-zinc-950/50 border-zinc-800">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={positionFilter} onValueChange={setPositionFilter}>
                <SelectTrigger className="w-full md:w-[200px] bg-zinc-950/50 border-zinc-800">
                  <SelectValue placeholder="Filter by Position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  {uniquePositions.map(pos => (
                    <SelectItem key={pos} value={pos}>
                      {pos.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-zinc-800">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
                  <TableHead className="w-[250px]">Applicant</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Loading applications...
                    </TableCell>
                  </TableRow>
                ) : filteredApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No applications found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplications.map((app) => (
                    <TableRow key={app.id} className="border-zinc-800 hover:bg-zinc-900/50">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{app.full_name}</span>
                          <span className="text-xs text-muted-foreground">{app.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{app.position_title}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(app.status)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(app.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          onClick={() => handleViewDetails(app)}
                          className="bg-zinc-800 hover:bg-zinc-700 text-white"
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto bg-zinc-950 border-l-zinc-800">
          {selectedApplication && (
            <>
              <SheetHeader className="mb-6 pr-8">
                <div className="flex flex-col gap-3">
                  <div>
                    <SheetTitle className="text-2xl">{selectedApplication.full_name}</SheetTitle>
                    <SheetDescription className="text-base mt-1">
                      Applied for <span className="text-primary font-medium">{selectedApplication.position_title}</span>
                    </SheetDescription>
                  </div>
                  <div>{getStatusBadge(selectedApplication.status)}</div>
                </div>
              </SheetHeader>
              
              <div className="space-y-6">
                {/* Contact Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Contact Information</h3>
                  <div className="grid gap-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${selectedApplication.email}`} className="hover:text-primary transition-colors">
                        {selectedApplication.email}
                      </a>
                    </div>
                    {selectedApplication.phone && (
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a href={`tel:${selectedApplication.phone}`} className="hover:text-primary transition-colors">
                          {selectedApplication.phone}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Applied on {new Date(selectedApplication.created_at).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</span>
                    </div>
                  </div>
                </div>

                <Separator className="bg-zinc-800" />

                {/* Links */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Links & Portfolio</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" size="sm" className="gap-2 border-zinc-800 bg-zinc-900/50" asChild>
                      <a href={selectedApplication.resume_link} target="_blank" rel="noopener noreferrer">
                        <FileText className="h-4 w-4" />
                        Resume
                      </a>
                    </Button>
                    {selectedApplication.linkedin && (
                      <Button variant="outline" size="sm" className="gap-2 border-zinc-800 bg-zinc-900/50" asChild>
                        <a href={selectedApplication.linkedin} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="h-4 w-4" />
                          LinkedIn
                        </a>
                      </Button>
                    )}
                    {selectedApplication.portfolio && (
                      <Button variant="outline" size="sm" className="gap-2 border-zinc-800 bg-zinc-900/50" asChild>
                        <a href={selectedApplication.portfolio} target="_blank" rel="noopener noreferrer">
                          <Globe className="h-4 w-4" />
                          Portfolio
                        </a>
                      </Button>
                    )}
                  </div>
                </div>

                <Separator className="bg-zinc-800" />

                {/* Cover Letter */}
                {selectedApplication.cover_letter && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Cover Letter</h3>
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 text-sm leading-relaxed whitespace-pre-wrap text-zinc-300">
                      {selectedApplication.cover_letter}
                    </div>
                  </div>
                )}

                <Separator className="bg-zinc-800" />

                {/* Actions */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Application Status</h3>
                  <div className="flex flex-col gap-4">
                    <Select 
                      value={selectedApplication.status} 
                      onValueChange={(val) => updateStatus(selectedApplication.id, val)}
                    >
                      <SelectTrigger className="w-full bg-zinc-900/50 border-zinc-800">
                        <SelectValue placeholder="Update Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="shortlisted">Shortlisted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div className="flex gap-2">
                      <Button className="flex-1 bg-primary hover:bg-primary/90" asChild>
                        <a href={selectedApplication.resume_link} target="_blank" rel="noopener noreferrer">
                          <Download className="mr-2 h-4 w-4" />
                          Download Resume
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
