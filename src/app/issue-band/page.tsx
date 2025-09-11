
"use client";

import { useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  serverTimestamp,
  query,
  where,
  or,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Search, Loader2, BadgeCheck, BadgeX } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

type Participant = {
  id: string;
  name: string;
  year_of_study: string;
  roll_no?: string;
  phone: string;
  isIssued: boolean;
  plan?: string;
};

export default function IssueBandPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [multipleMatches, setMultipleMatches] = useState<Participant[]>([]);
  const [showSelectionDialog, setShowSelectionDialog] = useState(false);
  const [showLunchTokenDialog, setShowLunchTokenDialog] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAdvancedSearch, setIsAdvancedSearch] = useState(false);
  const { toast } = useToast();

  const fetchParticipantAndStatus = async (
    participantData: Omit<Participant, "isIssued">
  ): Promise<Participant> => {
    const issuedDocRef = doc(db, "issued", participantData.id);
    const issuedDocSnap = await getDoc(issuedDocRef);
    return { ...participantData, isIssued: issuedDocSnap.exists() };
  };

  const searchParticipant = async () => {
    if (!searchTerm.trim()) {
      setError("Please enter a search term.");
      return;
    }
    setLoading(true);
    setError(null);
    setParticipant(null);
    setMultipleMatches([]);

    const normalizedSearchTerm = searchTerm.toUpperCase();

    try {
      const registrationsCol = collection(db, "registrations");
      const matches: Omit<Participant, 'isIssued'>[] = [];
      const uniqueMatchIds = new Set<string>();

      const queries = [where('roll_no', '==', normalizedSearchTerm)];
      if (isAdvancedSearch) {
          queries.push(where('phone', '==', searchTerm));
      }

      const q = query(registrationsCol, or(...queries));

      const querySnapshot = await getDocs(q);
      
      querySnapshot.forEach(docSnap => {
          if (!uniqueMatchIds.has(docSnap.id)) {
              matches.push({ id: docSnap.id, ...docSnap.data() } as Omit<Participant, 'isIssued'>);
              uniqueMatchIds.add(docSnap.id);
          }
      });
      
      if (matches.length === 0) {
          const allDocsSnapshot = await getDocs(registrationsCol);
          allDocsSnapshot.forEach(docSnap => {
              if (uniqueMatchIds.has(docSnap.id)) return;

              const data = docSnap.data();
              const docId = docSnap.id.toUpperCase();
              
              let isMatch = false;

              if (docId === normalizedSearchTerm) {
                  isMatch = true;
              }
              else if (searchTerm.length >= 4 && data.roll_no && data.roll_no.toUpperCase().endsWith(normalizedSearchTerm)) {
                 isMatch = true;
              }
              else if (searchTerm.length >= 4 && docId.endsWith(normalizedSearchTerm)) {
                 isMatch = true;
              }

              if (isMatch) {
                  matches.push({ id: docSnap.id, ...data } as Omit<Participant, 'isIssued'>);
                  uniqueMatchIds.add(docSnap.id);
              }
          });
      }

      if (matches.length > 1) {
        const matchesWithStatus = await Promise.all(matches.map(p => fetchParticipantAndStatus(p)));
        setMultipleMatches(matchesWithStatus);
        setShowSelectionDialog(true);
      } else if (matches.length === 1) {
        const singleMatch = await fetchParticipantAndStatus(matches[0]);
        setParticipant(singleMatch);
      } else {
         setError("No participant found with the provided details.");
      }

    } catch (e: unknown) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Failed to search for participant. Details: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleIssue = async () => {
    if (!participant) return;
    setLoading(true);
    try {
      const issuedDocRef = doc(db, "issued", participant.id);
      const { isIssued, ...participantData } = participant;

      await setDoc(issuedDocRef, {
        ...participantData,
        issuedAt: serverTimestamp(),
      });

      setParticipant({ ...participant, isIssued: true });
      toast({
        title: "Success!",
        description: `${participant.name} has been marked as issued.`,
      });
    } catch (e: unknown) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to mark as issued. Details: ${errorMessage}`,
      });
    } finally {
      setLoading(false);
      setShowLunchTokenDialog(false);
    }
  };

  const handleMarkAsIssuedClick = () => {
     if (!participant) return;
     const plan = participant.plan || '';
     const isOtherCollege = !plan.toLowerCase().includes("vardhaman") && plan.toLowerCase() !== "spot";

    if (isOtherCollege) {
      setShowLunchTokenDialog(true);
    } else {
      handleIssue();
    }
  }

  const handleSelectMatch = () => {
    const selected = multipleMatches.find(p => p.id === selectedMatchId);
    if (selected) {
        setParticipant(selected);
    }
    setShowSelectionDialog(false);
    setMultipleMatches([]);
    setSelectedMatchId(null);
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Issue Wristband</h1>
      <Card className="max-w-md mx-auto shadow-lg">
        <CardHeader>
          <CardTitle>Participant Search</CardTitle>
          <CardDescription>
            Enter a full Roll Number, or use advanced search for Phone Numbers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchParticipant()}
              disabled={loading}
            />
            <Button onClick={searchParticipant} disabled={loading}>
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Search />
              )}
              <span className="sr-only">Search</span>
            </Button>
          </div>
          
          <div className="flex items-center space-x-2 mb-4">
            <Switch
                id="advanced-search-toggle"
                checked={isAdvancedSearch}
                onCheckedChange={setIsAdvancedSearch}
                disabled={loading}
            />
            <Label htmlFor="advanced-search-toggle">Advanced Search (by Phone No.)</Label>
          </div>


          {error && (
             <Alert variant="destructive">
                <AlertTitle>Search Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {participant && (
            <Card className="mt-4 bg-secondary">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <p><strong>Name:</strong> {participant.name}</p>
                  <p><strong>Year:</strong> {participant.year_of_study}</p>
                  <p><strong>Roll No:</strong> {participant.roll_no || "N/A"}</p>
                  <p><strong>Phone:</strong> {participant.phone}</p>
                  <p><strong>Plan:</strong> {participant.plan || "N/A"}</p>
                  <div className="flex items-center gap-2 pt-2">
                    <strong>Status:</strong>
                    {participant.isIssued ? (
                        <span className="flex items-center gap-1 text-green-600 font-semibold">
                            <BadgeCheck size={20} /> Issued
                        </span>
                    ) : (
                         <span className="flex items-center gap-1 text-red-600 font-semibold">
                            <BadgeX size={20} /> Not Issued
                        </span>
                    )}
                  </div>
                </div>
                <Button
                  className="w-full mt-6"
                  onClick={handleMarkAsIssuedClick}
                  disabled={loading || participant.isIssued}
                >
                  {participant.isIssued ? "Already Issued" : "Mark as Issued"}
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Dialog open={showSelectionDialog} onOpenChange={setShowSelectionDialog}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Multiple Matches Found</DialogTitle>
                <DialogDescription>
                    Please select the correct participant from the list below.
                </DialogDescription>
            </DialogHeader>
            <RadioGroup onValueChange={setSelectedMatchId} className="space-y-2 py-4">
                {multipleMatches.map(p => (
                    <div key={p.id} className="flex items-center space-x-2 rounded-md border p-3">
                       <RadioGroupItem value={p.id} id={p.id} />
                       <Label htmlFor={p.id} className="flex-1 cursor-pointer">
                          <div>
                            <span className="font-bold">{p.roll_no || p.id}</span> - <span className="text-muted-foreground">{p.name}</span>
                          </div>
                       </Label>
                    </div>
                ))}
            </RadioGroup>
            <Button onClick={handleSelectMatch} disabled={!selectedMatchId}>
                Select Participant
            </Button>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showLunchTokenDialog} onOpenChange={setShowLunchTokenDialog}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Reminder</AlertDialogTitle>
            <AlertDialogDescription>
                Give lunch token to the participant.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogAction onClick={handleIssue} disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : "OK"}
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
