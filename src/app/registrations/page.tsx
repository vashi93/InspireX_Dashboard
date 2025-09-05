
"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, doc, getDoc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, Edit, Save } from "lucide-react";
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type Participant = {
  id: string;
  plan: string;
  name?: string;
  roll_no?: string;
  phone?: string;
  [key: string]: any;
};

const ParticipantTable = ({ participants, refreshParticipants }: { participants: Participant[], refreshParticipants: () => void }) => {
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Participant | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleRowClick = (participant: Participant) => {
    setSelectedParticipant(participant);
    setEditData(participant);
    setIsEditing(false);
  };

  const handleCloseDialog = () => {
    setSelectedParticipant(null);
    setEditData(null);
    setIsEditing(false);
  };

  const handleEditChange = (key: string, value: string) => {
    if (editData) {
      setEditData({ ...editData, [key]: value });
    }
  };

  const handleSave = async () => {
    if (!editData || !selectedParticipant) return;
    setIsSaving(true);

    const oldId = selectedParticipant.id;
    const newId = editData.id;
    
    // Remove id from the data to be saved in Firestore document
    const { id, ...dataToSave } = editData;

    try {
        if (oldId !== newId) {
            // Document ID has changed, so create a new doc and delete the old one
            const newDocRef = doc(db, "registrations", newId);
            const oldDocRef = doc(db, "registrations", oldId);
            
            // Check if a registration with the new ID already exists
            const newDocSnap = await getDoc(newDocRef);
            if (newDocSnap.exists()) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: `A registration with ID '${newId}' already exists.`,
                });
                setIsSaving(false);
                return;
            }

            await setDoc(newDocRef, dataToSave);
            await deleteDoc(oldDocRef);

            toast({
                title: "Success",
                description: "Participant details updated and document ID changed.",
            });
        } else {
            // Document ID is the same, just update the data
            const docRef = doc(db, "registrations", oldId);
            await updateDoc(docRef, dataToSave);
            toast({
                title: "Success",
                description: "Participant details updated.",
            });
        }
        
        handleCloseDialog();
        refreshParticipants(); // Refresh the list in the parent component

    } catch (error) {
        console.error("Error updating document: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to save changes.",
        });
    } finally {
        setIsSaving(false);
    }
  };


  const hiddenFields = ["uid"];

  return (
    <>
      <ScrollArea className="h-[calc(100vh-20rem)] rounded-md border">
        <Table>
          <TableHeader className="sticky top-0 bg-secondary">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Roll No.</TableHead>
              <TableHead>Phone</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.length > 0 ? (
              participants.map((p) => (
                <TableRow key={p.id} onClick={() => handleRowClick(p)} className="cursor-pointer">
                  <TableCell className="font-medium">{p.name || 'N/A'}</TableCell>
                  <TableCell>{p.roll_no || 'N/A'}</TableCell>
                  <TableCell>{p.phone || 'N/A'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  No participants in this category.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
       <Dialog open={!!selectedParticipant} onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Participant" : "Participant Details"}</DialogTitle>
            <DialogDescription>
              {isEditing ? `Editing details for ${selectedParticipant?.name}` : `Full information for ${selectedParticipant?.name || 'the participant'}.`}
            </DialogDescription>
          </DialogHeader>
          {editData && (
            <ScrollArea className="max-h-[60vh]">
              <div className="grid gap-4 py-4 pr-6">
                {Object.entries(editData)
                  .filter(([key]) => !hiddenFields.includes(key))
                  .map(([key, value]) => {
                    const formattedKey = key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                     if (isEditing) {
                        return (
                             <div className="grid grid-cols-3 items-center gap-4" key={key}>
                                <Label htmlFor={key} className="text-right font-semibold text-muted-foreground col-span-1">{formattedKey}</Label>
                                <Input
                                    id={key}
                                    value={String(value ?? '')}
                                    onChange={(e) => handleEditChange(key, e.target.value)}
                                    className="col-span-2"
                                />
                             </div>
                        );
                     } else {
                        if (key === "transactionScreenshot") {
                          return (
                            <div className="grid grid-cols-3 items-center gap-4" key={key}>
                              <span className="text-right font-semibold text-muted-foreground col-span-1">{formattedKey}</span>
                              <div className="col-span-2">
                                 {value ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(String(value), "_blank")}
                                    >
                                        View Screenshot
                                    </Button>
                                 ) : (
                                    <span className="text-sm text-muted-foreground">Not Provided</span>
                                 )}
                              </div>
                            </div>
                          );
                        }
                        return (
                          <div className="grid grid-cols-3 items-center gap-4" key={key}>
                            <span className="text-right font-semibold text-muted-foreground col-span-1">{formattedKey}</span>
                            <span className="col-span-2 break-words text-sm">{String(value && typeof value.toDate === 'function' ? value.toDate().toLocaleString() : value ?? 'N/A')}</span>
                          </div>
                        );
                     }
                  })}
              </div>
            </ScrollArea>
          )}
           <DialogFooter className="sm:justify-between">
                <div>
                  {!isEditing ? (
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      <Edit className="mr-2" /> Edit
                    </Button>
                  ) : (
                     <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  )}
                </div>
                <div>
                   {isEditing && (
                    <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving ? <Loader2 className="animate-spin" /> : <Save className="mr-2" />} Save Changes
                    </Button>
                  )}
                  <DialogClose asChild>
                    <Button type="button" variant="secondary" className={isEditing ? 'hidden' : 'inline-flex'}>
                      Close
                    </Button>
                  </DialogClose>
                </div>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};


export default function RegistrationsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchParticipants = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, "registrations"));
    const fetchedParticipants: Participant[] = [];
    querySnapshot.forEach((doc) => {
      fetchedParticipants.push({ id: doc.id, ...doc.data() } as Participant);
    });
    setParticipants(fetchedParticipants);
    setLoading(false);
  };

  useEffect(() => {
    fetchParticipants();
  }, []);

  const vardhamanParticipants = participants.filter(
    (p) => p.plan && p.plan.toLowerCase().includes("vardhaman")
  );
  const otherParticipants = participants.filter(
    (p) => !p.plan || !p.plan.toLowerCase().includes("vardhaman")
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Registrations by College</h1>
      <Tabs defaultValue="vardhaman">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="vardhaman">Vardhaman College</TabsTrigger>
          <TabsTrigger value="other">Other Colleges</TabsTrigger>
        </TabsList>
        <TabsContent value="vardhaman">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Vardhaman Registrations
              </CardTitle>
              <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-accent" />
                  <span className="text-2xl font-bold text-primary">{vardhamanParticipants.length}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ParticipantTable participants={vardhamanParticipants} refreshParticipants={fetchParticipants} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="other">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Other College Registrations
              </CardTitle>
               <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-accent" />
                  <span className="text-2xl font-bold text-primary">{otherParticipants.length}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ParticipantTable participants={otherParticipants} refreshParticipants={fetchParticipants} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
