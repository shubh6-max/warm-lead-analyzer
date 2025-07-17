import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LeadCard, Lead } from "@/components/LeadCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, AlertCircle } from "lucide-react";
import mathcoLogo from "@/assets/mathco-logo.png";

const Index = () => {
  const [stakeholderEmail, setStakeholderEmail] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [responses, setResponses] = useState<Record<string, { score: string; comment: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLeads = async () => {
      // Get email from URL params
      const urlParams = new URLSearchParams(window.location.search);
      const email = urlParams.get("email");
      setStakeholderEmail(email);

      if (email) {
        try {
          // Use the new database function to get leads for this stakeholder
          const { data, error } = await supabase
            .rpc('get_leads_for_stakeholder', { p_email: email });

          if (error) {
            console.error('Error fetching leads:', error);
            toast({
              title: "Error",
              description: "Failed to load leads. Please try again.",
              variant: "destructive",
            });
            return;
          }

          // Map function data to Lead interface
          const mappedLeads: Lead[] = (data || []).map(row => ({
            id: row.lead_id.toString(),
            name: row.target_lead_name || "",
            title: row.target_lead_title || "",
            company: row.company_name || "",
            linkedinUrl: row.target_lead_url || ""
          }));

          setLeads(mappedLeads);

          // Initialize responses with existing data if available
          const initialResponses: Record<string, { score: string; comment: string }> = {};
          data?.forEach(row => {
            initialResponses[row.lead_id.toString()] = { 
              score: row.existing_score ? row.existing_score.toString() : "", 
              comment: row.existing_comment || "" 
            };
          });
          setResponses(initialResponses);
        } catch (error) {
          console.error('Error:', error);
          toast({
            title: "Error",
            description: "Failed to load leads. Please try again.",
            variant: "destructive",
          });
        }
      }
      setIsLoading(false);
    };

    fetchLeads();
  }, [toast]);

  const handleScoreChange = (leadId: string, score: string) => {
    setResponses(prev => ({
      ...prev,
      [leadId]: { ...prev[leadId], score }
    }));
  };

  const handleCommentChange = (leadId: string, comment: string) => {
    setResponses(prev => ({
      ...prev,
      [leadId]: { ...prev[leadId], comment }
    }));
  };

  const handleSubmit = async () => {
    // Validate all leads have scores
    const missingScores = leads.filter(lead => !responses[lead.id]?.score);
    if (missingScores.length > 0) {
      toast({
        title: "Incomplete Form",
        description: "Please provide a relationship score for all leads.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Save responses to the new stakeholder_responses table
      for (const lead of leads) {
        const response = responses[lead.id];
        
        // Use upsert to handle both new responses and updates
        const { error } = await supabase
          .from('stakeholder_responses')
          .upsert({
            lead_id: parseInt(lead.id),
            stakeholder_email: stakeholderEmail,
            relationship_score: parseInt(response.score),
            comment: response.comment || null
          }, {
            onConflict: 'lead_id,stakeholder_email'
          });

        if (error) {
          console.error('Error saving response:', error);
          throw error;
        }
      }

      // Update lead status to 'Done' in the leads table
      const leadIds = leads.map(lead => parseInt(lead.id));
      const { error: statusError } = await supabase
        .from('leads_with_status')
        .update({ Status: 'Done' })
        .in('id', leadIds);

      if (statusError) {
        console.error('Error updating lead status:', statusError);
        throw statusError;
      }
      
      toast({
        title: "Responses Recorded",
        description: "✅ Your responses have been recorded. Thank you!",
      });

      // Reset form
      setLeads([]);
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: "Error",
        description: "Failed to submit responses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading leads...</p>
        </div>
      </div>
    );
  }

  if (!stakeholderEmail) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please access this form using your personalized email link (e.g., ?email=your@email.com)
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">All Caught Up!</h1>
          <p className="text-muted-foreground">✅ You have no pending leads.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src={mathcoLogo} 
                alt="MathCo Logo" 
                className="h-12 bg-white p-2 rounded-lg shadow-sm"
              />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Warm Outreach Relationship Survey</h1>
                <p className="text-muted-foreground">Welcome, {stakeholderEmail}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <p className="text-lg text-muted-foreground">
            Please rate your relationship strength with the following leads:
          </p>
        </div>

        <div className="space-y-6">
          {leads.map((lead, index) => (
            <div key={lead.id} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <LeadCard
                lead={lead}
                score={responses[lead.id]?.score || ""}
                comment={responses[lead.id]?.comment || ""}
                onScoreChange={(score) => handleScoreChange(lead.id, score)}
                onCommentChange={(comment) => handleCommentChange(lead.id, comment)}
              />
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            size="lg"
            className="px-8 py-3 text-lg font-medium"
          >
            {isSubmitting ? "Submitting..." : "Submit Responses"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
