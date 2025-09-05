
"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, QuerySnapshot, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Dashboard from "@/components/dashboard";
import { Loader2 } from "lucide-react";

type Participant = {
  id: string;
  [key: string]: any;
};

export default function Home() {
  const [participants, setParticipants] = useState<Participant[] | null>(null);
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getParticipants = async () => {
      try {
        const registrationsCol = collection(db, "registrations");
        const registrationSnapshot: QuerySnapshot<DocumentData> = await getDocs(registrationsCol);
        const fetchedParticipants: Participant[] = registrationSnapshot.docs.map(doc => {
          const data = doc.data();
          // Firestore Timestamps are not serializable if passed between server/client, but good practice to convert.
          for (const key in data) {
            if (data[key] && typeof data[key].toDate === 'function') {
              data[key] = data[key].toDate().toISOString();
            }
          }
          return {
            id: doc.id,
            ...data
          };
        });
        setParticipants(fetchedParticipants);
      } catch (e: unknown) {
        console.error(e);
        if (e instanceof Error) {
            setError(`Failed to retrieve data from Firestore. Please check your Firebase configuration and network connection. Details: ${e.message}`);
        } else {
            setError("An unknown error occurred while fetching registration data.");
        }
      } finally {
        setLoading(false);
      }
    };
    
    getParticipants();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return <Dashboard participants={participants} error={error} />;
}
