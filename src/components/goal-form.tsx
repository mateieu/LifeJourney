"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { createGoalAction } from "@/app/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface GoalFormProps {
  children: React.ReactNode;
  userId: string;
}

export function GoalForm({ children, userId }: GoalFormProps) {
  const [open, setOpen] = useState(false);
  const [goalType, setGoalType] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [targetDate, setTargetDate] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("goalType", goalType);
    formData.append("targetValue", targetValue);
    formData.append("targetDate", targetDate);

    await createGoalAction(formData);
    setOpen(false);
    // Reset form
    setGoalType("");
    setTargetValue("");
    setTargetDate("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Health Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="goalType">Goal Type</Label>
            <Select value={goalType} onValueChange={setGoalType} required>
              <SelectTrigger>
                <SelectValue placeholder="Select goal type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weight_loss">Weight Loss</SelectItem>
                <SelectItem value="steps">Daily Steps</SelectItem>
                <SelectItem value="workout">Workout Sessions</SelectItem>
                <SelectItem value="meditation">Meditation Minutes</SelectItem>
                <SelectItem value="water">Water Intake</SelectItem>
                <SelectItem value="sleep">Sleep Hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetValue">Target Value</Label>
            <Input
              id="targetValue"
              type="number"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              placeholder="Enter target value"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetDate">Target Date</Label>
            <Input
              id="targetDate"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Goal</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
