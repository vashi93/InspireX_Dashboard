"use client";

import { useState } from "react";
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
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Participant = {
  id: string;
  [key: string]: any;
};

interface ParticipantListProps {
  participants: Participant[];
}

export default function ParticipantList({ participants }: ParticipantListProps) {
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);

  const handleRowClick = (participant: Participant) => {
    setSelectedParticipant(participant);
  };

  const handleCloseDialog = () => {
    setSelectedParticipant(null);
  };

  const hiddenFields = ["uid", "plan"];

  return (
    <>
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-12rem)] rounded-md">
            <Table>
              <TableHeader className="sticky top-0 bg-secondary z-10">
                <TableRow>
                  <TableHead>Document ID</TableHead>
                  <TableHead>Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.length > 0 ? (
                  participants.map((participant) => (
                    <TableRow
                      key={participant.id}
                      onClick={() => handleRowClick(participant)}
                      className="cursor-pointer"
                    >
                      <TableCell className="font-mono text-sm">{participant.id}</TableCell>
                      <TableCell>{participant.name || "N/A"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="h-24 text-center">
                      No registrations yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
      
      <Dialog open={!!selectedParticipant} onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Participant Details</DialogTitle>
            <DialogDescription>
              Full information for the selected participant.
            </DialogDescription>
          </DialogHeader>
          {selectedParticipant && (
            <div className="grid gap-4 py-4">
              {Object.entries(selectedParticipant)
                .filter(([key]) => !hiddenFields.includes(key))
                .map(([key, value]) => {
                  if (key === "transactionScreenshot") {
                    return (
                      <div className="grid grid-cols-4 items-center gap-4" key={key}>
                        <span className="text-right font-semibold capitalize col-span-1">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <div className="col-span-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(String(value), "_blank")}
                          >
                            View Image
                          </Button>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div className="grid grid-cols-4 items-center gap-4" key={key}>
                      <span className="text-right font-semibold capitalize col-span-1">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="col-span-3 break-words">{String(value)}</span>
                    </div>
                  );
                })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
