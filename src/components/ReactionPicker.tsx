import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Heart, Laugh, PartyPopper, Frown, Angry } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReactionPickerProps {
  onReact: (type: string) => void;
  currentReaction?: string;
  count: number;
}

const reactions = [
  { type: "like", icon: Heart, label: "Like", color: "text-red-500" },
  { type: "love", icon: Heart, label: "Love", color: "text-pink-500" },
  { type: "haha", icon: Laugh, label: "Haha", color: "text-yellow-500" },
  { type: "wow", icon: PartyPopper, label: "Wow", color: "text-purple-500" },
  { type: "sad", icon: Frown, label: "Sad", color: "text-blue-500" },
  { type: "angry", icon: Angry, label: "Angry", color: "text-orange-500" },
];

export const ReactionPicker = ({ onReact, currentReaction, count }: ReactionPickerProps) => {
  const [open, setOpen] = useState(false);
  const currentReactionData = reactions.find((r) => r.type === currentReaction);
  const Icon = currentReactionData?.icon || Heart;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "gap-2 transition-all hover:scale-105",
            currentReaction && currentReactionData?.color
          )}
        >
          <Icon className={cn("h-4 w-4", currentReaction && "fill-current")} />
          <span>{count > 0 ? count : ""}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <div className="flex gap-1">
          {reactions.map((reaction) => {
            const ReactionIcon = reaction.icon;
            return (
              <Button
                key={reaction.type}
                variant="ghost"
                size="sm"
                className={cn(
                  "hover:scale-125 transition-all",
                  reaction.color
                )}
                onClick={() => {
                  onReact(reaction.type);
                  setOpen(false);
                }}
              >
                <ReactionIcon className="h-5 w-5 fill-current" />
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};
