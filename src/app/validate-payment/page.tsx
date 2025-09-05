
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  deleteDoc,
  serverTimestamp
} from "firebase/firestore";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, X, AlertTriangle, Info } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type Participant = {
  id: string;
  [key: string]: any;
};

export default function ValidatePaymentPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUnvalidatedParticipants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const registrationsCol = collection(db, "registrations");
      const snapshot = await getDocs(registrationsCol);
      
      const allParticipants: Participant[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const unvalidatedParticipants = allParticipants.filter(p => p.valid === undefined || p.valid === null);
      
      const unvalidatedWithTimestamps: Participant[] = [];
      const validatedOrNoTimestamp: Participant[] = [];

      unvalidatedParticipants.forEach(p => {
        if(p.createdAt && typeof p.createdAt.toDate === 'function') {
           unvalidatedWithTimestamps.push(p);
        } else {
           validatedOrNoTimestamp.push(p);
        }
      });
      
      unvalidatedWithTimestamps.sort((a,b) => a.createdAt.toDate().getTime() - b.createdAt.toDate().getTime());
      
      setParticipants([...unvalidatedWithTimestamps, ...validatedOrNoTimestamp]);
      setCurrentIndex(0);

      if (unvalidatedParticipants.length === 0) {
        setError("No more unvalidated participants found.");
      }

    } catch (e: unknown) {
      console.error(e);
      const errorMessage =
        e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Failed to fetch participants. Details: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnvalidatedParticipants();
  }, [fetchUnvalidatedParticipants]);

  const handleNextParticipant = () => {
    if (currentIndex < participants.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
       setError("You have reached the end of the list.");
       setParticipants([]);
    }
  };

  const handleValidation = async (isValid: boolean) => {
    if (processing || participants.length === 0) return;
    
    setProcessing(true);
    const participant = participants[currentIndex];

    try {
      if (isValid) {
        const participantRef = doc(db, "registrations", participant.id);
        await updateDoc(participantRef, {
          valid: true,
          validatedAt: serverTimestamp()
        });
        toast({
          title: "Success",
          description: `${participant.name} has been marked as valid.`,
        });
      } else {
        const faultyRegRef = doc(db, "faulty_registrations", participant.id);
        await setDoc(faultyRegRef, { 
            ...participant, 
            markedAsFaultyAt: serverTimestamp()
        });
        const originalDocRef = doc(db, "registrations", participant.id);
        await deleteDoc(originalDocRef);
        
        toast({
          variant: "destructive",
          title: "Marked as Invalid",
          description: `${participant.name} has been moved to faulty registrations.`,
        });
      }
      handleNextParticipant();
    } catch (e: unknown) {
      console.error(e);
      const errorMessage =
        e instanceof Error ? e.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to process validation. Details: ${errorMessage}`,
      });
    } finally {
      setProcessing(false);
    }
  };

  const currentParticipant = participants.length > 0 ? participants[currentIndex] : null;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
       <h1 className="text-2xl font-bold mb-1">Validate Payments</h1>
       <p className="text-muted-foreground mb-4">
         Remaining validations: {participants.length > 0 ? participants.length - currentIndex : 0}
       </p>
      
      {error && !currentParticipant && (
        <Alert variant={error.includes("No more") ? "default" : "destructive"} className="max-w-xl mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{error.includes("No more") ? "All Done!" : "Error"}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
             <Button onClick={fetchUnvalidatedParticipants} className="mt-4">
                <Info className="mr-2 h-4 w-4" />
                Check for New Registrations
             </Button>
        </Alert>
      )}

      {currentParticipant ? (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{currentParticipant.name}</CardTitle>
            <CardDescription>
              Document ID: <span className="font-mono">{currentParticipant.id}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Side: Details */}
              <div className="space-y-4">
                  <div>
                    <h3 className="text-sm text-muted-foreground">Transaction ID</h3>
                    <p className="text-xl font-semibold font-mono tracking-wider text-primary">
                        {currentParticipant.transactionId || 'N/A'}
                    </p>
                  </div>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>View Full Details</AccordionTrigger>
                        <AccordionContent>
                           <div className="space-y-2 pt-2">
                            {Object.entries(currentParticipant)
                                .filter(([key]) => !['transactionScreenshot', 'transactionId', 'valid', 'uid', 'plan', 'name'].includes(key))
                                .map(([key, value]) => (
                                    <div className="flex justify-between text-sm" key={key}>
                                    <strong className="capitalize text-muted-foreground">{key.replace(/([A-Z])/g, ' $1')}:</strong>
                                    <span className="text-right break-all">{String(value && typeof value.toDate === 'function' ? value.toDate().toLocaleString() : value)}</span>
                                    </div>
                                ))}
                           </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
              </div>

              {/* Right Side: Screenshot */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Transaction Screenshot</h3>
                {currentParticipant.transactionScreenshot ? (
                   <a href={currentParticipant.transactionScreenshot} target="_blank" rel="noopener noreferrer">
                    <Image
                        src={currentParticipant.transactionScreenshot}
                        alt="Transaction Screenshot"
                        width={400}
                        height={800}
                        className="rounded-md border object-contain hover:opacity-80 transition-opacity"
                    />
                  </a>
                ) : (
                  <Alert variant="destructive">
                     <AlertTriangle className="h-4 w-4" />
                     <AlertTitle>No Screenshot</AlertTitle>
                     <AlertDescription>No transaction screenshot was provided for this participant.</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
              <Button
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => handleValidation(false)}
                disabled={processing}
              >
                {processing ? <Loader2 className="animate-spin" /> : <X />}
                Not Valid
              </Button>
              <Button
                variant="outline"
                className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
                onClick={() => handleValidation(true)}
                disabled={processing || !currentParticipant.transactionScreenshot}
              >
                 {processing ? <Loader2 className="animate-spin" /> : <Check />}
                Valid
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

    