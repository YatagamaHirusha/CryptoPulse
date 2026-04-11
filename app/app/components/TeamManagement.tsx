'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  User, 
  Shield, 
  Edit2, 
  Trash2, 
  Plus, 
  Check, 
  X,
  Mail,
  Lock
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  system_role: 'superadmin' | 'moderator' | 'author';
  updated_at: string;
}

export default function TeamManagement({ session }: { session: any }) {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  
  // Form State
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserSystemRole, setNewUserSystemRole] = useState('author');
  const [newUserDisplayRole, setNewUserDisplayRole] = useState('Author');
  const [creatingUser, setCreatingUser] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, system_role, updated_at')
      .order('updated_at', { ascending: false });
    
    console.log('Fetched users:', data, 'Error:', error);
    
    if (error) {
      console.error('Error fetching users:', error.message, error.details, error.hint);
    } else {
      setUsers(data as any || []);
    }
    setLoading(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingUser(true);

    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentSession?.access_token}`
        },
        body: JSON.stringify({
          email: newUserEmail,
          password: newUserPassword,
          fullName: newUserName,
          system_role: newUserSystemRole,
          role: newUserDisplayRole
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create user');
      }

      // Success
      setIsAddUserOpen(false);
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserName('');
      setNewUserSystemRole('author');
      setNewUserDisplayRole('Author');
      fetchUsers();
      alert('User created successfully!');

    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setCreatingUser(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'superadmin':
        return <Badge className="bg-red-600">Super Admin</Badge>;
      case 'moderator':
        return <Badge className="bg-purple-600">Moderator</Badge>;
      case 'author':
        return <Badge className="bg-blue-600">Author</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Team Management</h2>
          <p className="text-zinc-400">Manage authors, moderators, and admins.</p>
        </div>
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="mr-2 h-4 w-4" /> Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
            <DialogHeader>
              <DialogTitle>Add New Team Member</DialogTitle>
              <DialogDescription>Create a new account for an author or moderator.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input 
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="John Doe"
                  className="bg-zinc-800 border-zinc-700"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="john@web3instant.com"
                  className="bg-zinc-800 border-zinc-700"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input 
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-zinc-800 border-zinc-700"
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label>System Role (Permissions)</Label>
                <Select value={newUserSystemRole} onValueChange={setNewUserSystemRole}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectItem value="author">Author</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="superadmin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-zinc-500">
                  {newUserSystemRole === 'author' && "Can create and schedule articles. Can only edit their own."}
                  {newUserSystemRole === 'moderator' && "Can edit, delete, and unpublish any article."}
                  {newUserSystemRole === 'superadmin' && "Full access to everything."}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Display Title</Label>
                <Input 
                  value={newUserDisplayRole}
                  onChange={(e) => setNewUserDisplayRole(e.target.value)}
                  placeholder="e.g. Blockchain Expert"
                  className="bg-zinc-800 border-zinc-700"
                  required
                />
                <p className="text-xs text-zinc-500">This is the title shown on their profile and articles.</p>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={creatingUser}>
                  {creatingUser ? 'Creating...' : 'Create User'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
                <TableHead className="text-zinc-400">Name</TableHead>
                <TableHead className="text-zinc-400">System Role</TableHead>
                <TableHead className="text-zinc-400">Display Title</TableHead>
                <TableHead className="text-zinc-400">Email</TableHead>
                <TableHead className="text-zinc-400">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-zinc-500">Loading...</TableCell>
                </TableRow>
              ) : users.map((user) => (
                <TableRow key={user.id} className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableCell className="font-medium text-white">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold">
                        {user.full_name?.charAt(0) || 'U'}
                      </div>
                      {user.full_name || 'Unknown'}
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.system_role || 'author')}</TableCell>
                  <TableCell className="text-zinc-300">{user.role}</TableCell>
                  <TableCell className="text-zinc-400">{user.email}</TableCell>
                  <TableCell className="text-zinc-400">
                    {user.updated_at ? new Date(user.updated_at).toLocaleDateString() : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
