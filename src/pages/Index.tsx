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
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLeads = async () => {
      // Get email from URL params
      const urlParams = new URLSearchParams(window.location.search);
      const email = urlParams.get("email");
      setStakeholderEmail(email);

      if (email) {
        try {
          // Fetch leads where the stakeholder email is in the Leadership contact email field
          const { data: leadsData, error: leadsError } = await supabase
            .from('leads_with_status')
            .select('*')
            .like('leadership_contact_email', `%${email}%`);

          if (leadsError) {
            console.error('Error fetching leads:', leadsError);
            toast({
              title: "Error",
              description: "Failed to load leads. Please try again.",
              variant: "destructive",
            });
            return;
          }

          // Filter leads to only include those where the email exactly matches one of the semicolon-separated emails
          const filteredLeads = (leadsData || []).filter(row => {
            const emails = (row.leadership_contact_email || "").split(";").map(e => e.trim().toLowerCase());
            return emails.includes(email.toLowerCase());
          });

          // Map data to Lead interface
          const mappedLeads: Lead[] = filteredLeads.map(row => ({
            id: row.lead_id.toString(),
            name: row.target_lead_name || "",
            title: row.target_lead_title || "",
            company: row.company_name || "",
            linkedinUrl: row.target_lead_linkedin_url || ""
          }));

          setLeads(mappedLeads);

          // Fetch existing responses for this stakeholder
          const leadIds = mappedLeads.map(lead => parseInt(lead.id));
          const { data: responsesData, error: responsesError } = await supabase
            .from('stakeholder_responses')
            .select('*')
            .eq('stakeholder_email', email)
            .in('lead_id', leadIds);

          if (responsesError) {
            console.error('Error fetching responses:', responsesError);
          }

          // Initialize responses with existing data
          const initialResponses: Record<string, { score: string; comment: string }> = {};
          mappedLeads.forEach(lead => {
            const existingResponse = responsesData?.find(r => r.lead_id === parseInt(lead.id));
            initialResponses[lead.id] = { 
              score: existingResponse?.relationship_score ? existingResponse.relationship_score.toString() : "", 
              comment: existingResponse?.comment || "" 
            };
          });
          setResponses(initialResponses);
          
          // Check if all leads have responses (user has submitted)
          const allLeadsResponded = mappedLeads.length > 0 && mappedLeads.every(lead => 
            responsesData?.some(r => r.lead_id === parseInt(lead.id))
          );
          setHasSubmitted(allLeadsResponded);
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
      // Save responses to stakeholder_responses table
      for (const lead of leads) {
        const response = responses[lead.id];
        
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
      
      toast({
        title: "Responses Recorded",
        description: "✅ Your responses have been recorded. Thank you!",
      });

      // Mark as submitted to prevent form from showing again
      setHasSubmitted(true);
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

  // If user has already submitted all responses, show thank you message
  if (hasSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Thank You!</h1>
          <p className="text-muted-foreground">✅ Your responses have been recorded successfully.</p>
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
