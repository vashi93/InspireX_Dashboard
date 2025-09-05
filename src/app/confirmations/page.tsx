
"use client";

import { useState, useEffect, useMemo } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import * as XLSX from "xlsx";
import { db } from "@/lib/firebase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Users, Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

type Participant = {
  id: string;
  plan?: string;
  name?: string;
  email?: string;
  [key: string]: any;
};

const ConfirmedParticipantTable = ({ participants }: { participants: Participant[] }) => {
  return (
    <ScrollArea className="h-[calc(100vh-22rem)] rounded-md border">
        <Table>
            <TableHeader className="sticky top-0 bg-secondary">
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {participants.length > 0 ? (
                    participants.map((p) => (
                        <TableRow key={p.id}>
                            <TableCell className="font-medium">{p.name || 'N/A'}</TableCell>
                            <TableCell>{p.email || 'N/A'}</TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={2} className="h-24 text-center">
                            No confirmed participants in this category.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    </ScrollArea>
  );
};


export default function ConfirmationsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchParticipants = async () => {
      setLoading(true);
      const q = query(collection(db, "registrations"), where("valid", "==", true));
      const querySnapshot = await getDocs(q);
      const fetchedParticipants: Participant[] = [];
      querySnapshot.forEach((doc) => {
        fetchedParticipants.push({ id: doc.id, ...doc.data() } as Participant);
      });
      setParticipants(fetchedParticipants);
      setLoading(false);
    };

    fetchParticipants();
  }, []);
  
  const { vardhamanParticipants, otherParticipants } = useMemo(() => {
    const vardhamanParticipants = participants.filter(
      (p) => p.plan && p.plan.toLowerCase().includes("vardhaman")
    );
    const otherParticipants = participants.filter(
      (p) => !p.plan || !p.plan.toLowerCase().includes("vardhaman")
    );
    return { vardhamanParticipants, otherParticipants };
  }, [participants]);

  const handleDownloadExcel = () => {
    try {
        const wb = XLSX.utils.book_new();

        const categories: { name: string; data: Participant[] }[] = [
            { name: 'Vardhaman College', data: vardhamanParticipants },
            { name: 'Other Colleges', data: otherParticipants }
        ];

        for (const category of categories) {
            if (category.data.length > 0) {
                const wsData = category.data.map(p => ({
                    Name: p.name || "N/A",
                    Email: p.email || "N/A",
                }));
                const ws = XLSX.utils.json_to_sheet(wsData);
                XLSX.utils.book_append_sheet(wb, ws, category.name);
            }
        }
        
        if (wb.SheetNames.length === 0) {
            toast({
                variant: "destructive",
                title: "No Data",
                description: "There are no confirmed participants to download.",
            });
            return;
        }

        XLSX.writeFile(wb, "confirmed_registrations.xlsx");

        toast({
            title: "Success!",
            description: "Excel file has been downloaded.",
        });

    } catch (error) {
        console.error("Failed to download excel:", error);
        toast({
            variant: "destructive",
            title: "Download Failed",
            description: "There was an error creating the Excel file.",
        });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Confirmed Registrations</h1>
        <Button onClick={handleDownloadExcel}>
            <Download className="mr-2" />
            Download Excel
        </Button>
      </div>
      
      {participants.length > 0 ? (
        <Tabs defaultValue="vardhaman">
            <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
                <TabsTrigger value="vardhaman">Vardhaman College</TabsTrigger>
                <TabsTrigger value="other">Other Colleges</TabsTrigger>
            </TabsList>
            <TabsContent value="vardhaman">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Vardhaman Confirmations
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-accent" />
                            <span className="text-2xl font-bold text-primary">{vardhamanParticipants.length}</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ConfirmedParticipantTable participants={vardhamanParticipants} />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="other">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Other College Confirmations
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-accent" />
                            <span className="text-2xl font-bold text-primary">{otherParticipants.length}</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ConfirmedParticipantTable participants={otherParticipants} />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      ) : (
        <Card>
            <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No confirmed registrations yet.</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
