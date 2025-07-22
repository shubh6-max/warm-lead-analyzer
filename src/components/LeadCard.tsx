import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { ExternalLink, User, Building } from "lucide-react";

export interface Lead {
  id: string;
  name: string;
  title: string;
  company: string;
  linkedinUrl: string;
}

interface LeadCardProps {
  lead: Lead;
  score: string;
  comment: string;
  onScoreChange: (value: string) => void;
  onCommentChange: (value: string) => void;
}

const relationshipOptions = [
  { value: "1", label: "1 - Don't Know", description: "No prior interaction" },
  { value: "2", label: "2 - Met Once", description: "Single brief encounter" },
  { value: "3", label: "3 - Professional Acquaintance", description: "Occasional professional contact" },
  { value: "4", label: "4 - Regular Contact", description: "Frequent professional interaction" },
  { value: "5", label: "5 - Close Relationship", description: "Strong professional relationship" }
];

export function LeadCard({ lead, score, comment, onScoreChange, onCommentChange }: LeadCardProps) {
  return (
    <Card className="bg-gradient-card shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in">
      <CardContent className="p-6">
        {/* Lead Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">{lead.name}</h3>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-muted-foreground font-medium">{lead.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{lead.company}</span>
            </div>
          </div>
          <a
            href={lead.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <span className="text-sm font-medium">LinkedIn</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        {/* Relationship Rating */}
        <div className="mb-6">
          <Label className="text-base font-medium mb-4 block">
            What is your relationship strength with {lead.name}?
          </Label>
          <RadioGroup value={score} onValueChange={onScoreChange} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {relationshipOptions.map((option) => (
              <div key={option.value} className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                <RadioGroupItem value={option.value} id={`${lead.id}-${option.value}`} className="mt-1" />
                <div className="flex-1">
                  <Label
                    htmlFor={`${lead.id}-${option.value}`}
                    className="text-sm font-medium cursor-pointer block"
                  >
                    {option.label}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Comments */}
        <div>
          <Label htmlFor={`${lead.id}-comment`} className="text-base font-medium mb-2 block">
            Comments for {lead.name} (optional)
          </Label>
          <Textarea
            id={`${lead.id}-comment`}
            placeholder="Add any additional context about your relationship..."
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            className="min-h-[80px] resize-none"
          />
        </div>
      </CardContent>
    </Card>
  );
}