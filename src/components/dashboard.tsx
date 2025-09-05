
"use client";

import { AlertCircle, Users, ExternalLink } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ChartTooltip, ChartTooltipContent, ChartContainer } from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";

type Participant = {
  id: string;
  createdAt?: string; // ISO string
  name?: string;
  transactionScreenshot?: string;
  [key: string]: any;
};

interface DashboardProps {
  participants: Participant[] | null;
  error?: string;
}

const processRegistrationData = (participants: Participant[] | null) => {
    const dailyCounts: { [key: string]: number } = {};
    const startDate = new Date("2025-08-27T00:00:00.000Z");
    const endDate = new Date("2025-09-13T23:59:59.999Z");

    // Initialize all dates in the range with 0 count
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateString = d.toISOString().split('T')[0];
        dailyCounts[dateString] = 0;
    }

    if (participants) {
        participants.forEach(p => {
            if (p.createdAt) {
                const regDate = new Date(p.createdAt);
                 if (regDate >= startDate && regDate <= endDate) {
                    const dateString = regDate.toISOString().split('T')[0];
                    if (dailyCounts[dateString] !== undefined) {
                        dailyCounts[dateString]++;
                    }
                }
            }
        });
    }

    return Object.entries(dailyCounts).map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        registrations: count
    })).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};


export default function Dashboard({ participants, error }: DashboardProps) {
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-background p-4">
        <Alert variant="destructive" className="max-w-lg shadow-lg">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-lg font-bold">Error Fetching Data</AlertTitle>
          <AlertDescription>
            There was a problem retrieving the data.
            <br />
            <strong>Details:</strong> {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const registrationChartData = processRegistrationData(participants);
  
  const sortedParticipants = participants 
    ? [...participants].sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return 0;
      })
    : [];
    
  const totalParticipants = sortedParticipants.length;

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <main className="flex-1 p-4 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="shadow-sm transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
              <Users className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{participants?.length ?? 0}</div>
              <p className="text-xs text-muted-foreground">Currently registered participants</p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <Card className="shadow-sm transition-all hover:shadow-lg w-full">
              <CardHeader>
                  <CardTitle>Daily Registrations</CardTitle>
                  <CardDescription>From 27 Aug to 13 Sep 2025</CardDescription>
              </CardHeader>
              <CardContent>
                  <ChartContainer config={{}} className="h-[350px] min-w-[600px]">
                       <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={registrationChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis 
                                  dataKey="date" 
                                  tickLine={false} 
                                  axisLine={false} 
                                  tickMargin={10} 
                                  fontSize={12}
                               />
                              <YAxis tickLine={false} axisLine={false} tickMargin={10} fontSize={12} allowDecimals={false} />
                               <Tooltip
                                  cursor={{ fill: 'hsl(var(--muted))' }}
                                  content={<ChartTooltipContent indicator="dot" />}
                              />
                              <Bar dataKey="registrations" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                          </BarChart>
                      </ResponsiveContainer>
                  </ChartContainer>
              </CardContent>
          </Card>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle>All Registrations</CardTitle>
                <CardDescription>A complete list of all participant sign-ups, sorted by time.</CardDescription>
            </CardHeader>
            <CardContent>
                 <ScrollArea className="h-[400px]">
                    <Table>
                        <TableHeader className="sticky top-0 bg-secondary">
                            <TableRow>
                                <TableHead>S.No.</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Payment Screenshot</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedParticipants.map((p, index) => {
                                const regDate = p.createdAt ? new Date(p.createdAt) : null;
                                const time = regDate?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) ?? 'N/A';
                                const date = regDate?.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) ?? 'N/A';
                                const serialNumber = totalParticipants - index;

                                return (
                                    <TableRow key={p.id}>
                                        <TableCell className="font-medium">{serialNumber}</TableCell>
                                        <TableCell>{p.name || 'N/A'}</TableCell>
                                        <TableCell>{time}</TableCell>
                                        <TableCell>{date}</TableCell>
                                        <TableCell className="text-right">
                                            {p.transactionScreenshot ? (
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={p.transactionScreenshot} target="_blank" rel="noopener noreferrer">
                                                        View <ExternalLink className="ml-2 h-3 w-3" />
                                                    </Link>
                                                </Button>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">Not Provided</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                             {sortedParticipants.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                    No registrations yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                 </ScrollArea>
            </CardContent>
        </Card>

      </main>
    </div>
  );
}
