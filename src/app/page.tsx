import { collection, getDocs, QuerySnapshot, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Dashboard from "@/components/dashboard";

type Participant = {
  id: string;
  [key: string]: any;
};

async function getParticipants(): Promise<{ participants?: Participant[]; error?: string }> {
  try {
    const registrationsCol = collection(db, "registrations");
    const registrationSnapshot: QuerySnapshot<DocumentData> = await getDocs(registrationsCol);
    const participants: Participant[] = registrationSnapshot.docs.map(doc => {
      const data = doc.data();
      // Firestore Timestamps are not serializable, so we need to convert them.
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
    return { participants };
  } catch (e: unknown) {
    console.error(e);
    if (e instanceof Error) {
        return { error: `Failed to retrieve data from Firestore. Please check your Firebase configuration and network connection. Details: ${e.message}` };
    }
    return { error: "An unknown error occurred while fetching registration data." };
  }
}

export default async function Home() {
  const { participants, error } = await getParticipants();

  return <Dashboard participants={participants ?? null} error={error} />;
}
