
"use client";

import { useState } from "react";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";


export default function SpotRegistrationPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [year, setYear] = useState("");
    const [phone, setPhone] = useState("");
    const [rollNo, setRollNo] = useState("");
    const [plan, setPlan] = useState("spot");
    const [hasRollNo, setHasRollNo] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const resetForm = () => {
        setName("");
        setEmail("");
        setYear("");
        setPhone("");
        setRollNo("");
        setPlan("spot");
        setError(null);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const requiredFields = [name, email, year, phone, plan];
        if (hasRollNo) {
            requiredFields.push(rollNo);
        }

        if (requiredFields.some(f => !f)) {
            setError("Please fill out all required fields.");
            return;
        }
        setError(null);
        setLoading(true);

        const docId = hasRollNo ? rollNo.toUpperCase() : phone;
        const docRef = doc(db, "registrations", docId);

        try {
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setError(`A registration with this ${hasRollNo ? "Roll Number" : "Phone Number"} already exists.`);
                setLoading(false);
                return;
            }

            const registrationData: any = {
                name,
                email,
                phone,
                year_of_study: year,
                valid: true,
                createdAt: serverTimestamp(),
                validatedAt: serverTimestamp(),
                plan: plan,
            };

            if (hasRollNo) {
                registrationData.roll_no = rollNo.toUpperCase();
            }

            await setDoc(docRef, registrationData);

            toast({
                title: "Success!",
                description: `${name} has been registered successfully.`,
            });
            resetForm();

        } catch (err: unknown) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(`Failed to register participant. Details: ${errorMessage}`);
            toast({
                variant: "destructive",
                title: "Error",
                description: `Failed to register participant.`,
            });
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="p-4 md:p-8">
            <h1 className="text-2xl font-bold mb-4">Spot Registration</h1>
            <Card className="max-w-lg mx-auto shadow-lg">
                <CardHeader>
                    <CardTitle>Add New Participant</CardTitle>
                    <CardDescription>
                        Enter the details below. This registration will be automatically validated.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                           <Label htmlFor="name">Name</Label>
                           <Input
                             id="name"
                             value={name}
                             onChange={(e) => setName(e.target.value)}
                             placeholder="Enter full name"
                             disabled={loading}
                             required
                           />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter email address"
                                disabled={loading}
                                required
                            />
                        </div>

                         <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Enter 10-digit phone number"
                                disabled={loading}
                                required
                                onInput={(e) => {
                                    const target = e.target as HTMLInputElement;
                                    target.value = target.value.replace(/[^0-9]/g, '').slice(0, 10);
                                }}
                            />
                        </div>

                        <div className="space-y-2">
                             <Label htmlFor="year">Year of Study</Label>
                             <Select onValueChange={setYear} value={year} disabled={loading} required>
                                <SelectTrigger id="year">
                                    <SelectValue placeholder="Select year..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1st Year">1st Year</SelectItem>
                                    <SelectItem value="2nd Year">2nd Year</SelectItem>
                                    <SelectItem value="3rd Year">3rd Year</SelectItem>
                                    <SelectItem value="4th Year">4th Year</SelectItem>
                                    <SelectItem value="Faculty">Faculty</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                         <div className="space-y-2">
                             <Label htmlFor="plan">Plan</Label>
                             <Select onValueChange={setPlan} value={plan} disabled={loading} required>
                                <SelectTrigger id="plan">
                                    <SelectValue placeholder="Select plan..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="spot">Spot</SelectItem>
                                    <SelectItem value="other college">Other College</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="space-y-2">
                           <div className="flex items-center space-x-2">
                                <Switch
                                    id="has-roll-no-toggle"
                                    checked={hasRollNo}
                                    onCheckedChange={setHasRollNo}
                                    disabled={loading}
                                />
                                 <Label htmlFor="has-roll-no-toggle">Has Roll Number?</Label>
                            </div>
                        </div>

                        {hasRollNo && (
                             <div className="space-y-2">
                                <Label htmlFor="rollNo">Roll Number</Label>
                                <Input
                                    id="rollNo"
                                    value={rollNo}
                                    onChange={(e) => setRollNo(e.target.value)}
                                    placeholder="Enter college roll number"
                                    disabled={loading}
                                    required={hasRollNo}
                                />
                            </div>
                        )}
                        
                        {error && (
                            <Alert variant="destructive">
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <>
                                 <UserPlus className="mr-2" />
                                 Add Participant
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
