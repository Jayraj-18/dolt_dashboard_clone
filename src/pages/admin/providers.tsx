import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Search } from 'lucide-react';
import {fetchCounts, fetchserviceproviders} from "../../api/AdminApi.js"
import { useEffect } from 'react';

const ProvidersManagement = () => {
    const [counts, setCounts] = useState({
    homeownerCount: 0,
    serviceProviderCount: 0,
    totalUsers: 0,
  });

  const [providers, setProviders] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');

const filteredProviders = providers.filter((p) =>
  p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  p.email.toLowerCase().includes(searchTerm.toLowerCase())
);
useEffect(() => {
  const loadData = async () => {
    try {
      const countData = await fetchCounts();
      const userList = await fetchserviceproviders();

      setCounts(countData);
      setProviders(userList);  // <-- SAVE PROVIDERS HERE
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  loadData();
}, []);




  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Service Providers</h1>
        <p className="text-muted-foreground mt-1">
          Manage your registered service providers
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Providers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{counts.serviceProviderCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Providers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{counts.serviceProviderCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Providers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Providers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Providers List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Skills</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Jobs</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
<TableBody>
  {filteredProviders.length > 0 ? (
    filteredProviders.map((provider) => (
      <TableRow key={provider.id}>
        
        {/* Name + Avatar */}
        <TableCell>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold uppercase">
              {provider.fullName[0]}
            </div>
            <span className="font-medium text-foreground">{provider.fullName}</span>
          </div>
        </TableCell>

        {/* Email */}
        <TableCell className="text-sm text-muted-foreground">
          {provider.email}
        </TableCell>

        {/* Skills */}
        <TableCell>
          <div className="flex gap-1 flex-wrap">
            {provider.skills && provider.skills.length > 0 ? (
              provider.skills.map((skill, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">No skills</span>
            )}
          </div>
        </TableCell>

        {/* Rating */}
        <TableCell>⭐ {provider.rating || 0}</TableCell>

        {/* Jobs */}
        <TableCell className="text-sm">
          {provider.completedJobs || 0}
        </TableCell>

        {/* Joined */}
        <TableCell className="text-sm text-muted-foreground">
            {provider.createdAt && provider.createdAt._seconds
                        ? new Date(
                            provider.createdAt._seconds * 1000
                          ).toLocaleDateString()
                        : "N/A"}
        </TableCell>

      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
        No providers found
      </TableCell>
    </TableRow>
  )}
</TableBody>


            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProvidersManagement;
