import pandas as pd
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime
from supabase import create_client


# === CONFIG ===
# ✅ Your Supabase credentials
SUPABASE_URL = "https://vxigtrpkjyrxsalbdxwv.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4aWd0cnBranlyeHNhbGJkeHd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NjA3MjMsImV4cCI6MjA2ODIzNjcyM30.0jI6MlT9C4iQ0kyPDAZ6sKbV1x8l572y_E7tPTMsyIY"

# ✅ Initialize client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# ✅ Fetch table data
response = supabase.table("leads_with_status").select("*").execute()
records = response.data
LOG_PATH = "email_log.csv"

SMTP_SERVER = "smtp.gmail.com"  # Use smtp.office365.com for Outlook
SMTP_PORT = 587
SENDER_EMAIL = "trailerbuddy96@gmail.com"
SENDER_PASSWORD = "whcy thim nsft kjcy"  # Use app password

BASE_FORM_URL = "https://warm-lead-whisperer-survey.vercel.app/"  # Replace with your deployed Streamlit form URL

def main():
    # --- Load Excel ---
    try:
        df = pd.DataFrame(records)
    except Exception as e:
        print(f"❌ Failed to load Excel: {e}")
        return

    not_done_df = df[df["status"].str.lower() == "Not Done"]

    # --- Group Leads by Stakeholder Email ---
# --- Group Leads by Stakeholder Email ---
    email_map = {}

    for _, row in not_done_df.iterrows():
        lead_name = row["target_lead_name"]
        raw_emails = row["leadership_contact_email"]
        leader_name = row.get("leadership_name", "there")

        for email in str(raw_emails).split(";"):
            email = email.strip().lower()
            if email not in email_map:
                email_map[email] = {
                    "leads": [],
                    "leadership_name": leader_name
                }
            email_map[email]["leads"].append(lead_name)


    # --- Send Emails ---
    log_rows = []

    for stakeholder_email, info in email_map.items():
        leads = info["leads"]
        leadership_name = info["leadership_name"] or stakeholder_email.split("@")[0].capitalize()

        if not leads:
            continue

        form_link = f"{BASE_FORM_URL}/?email={stakeholder_email}"
        lead_list_html = "".join(f"<li>{lead}</li>" for lead in leads)

        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
            <p>Hi {leadership_name},</p>

            <p>Hope you're doing well!</p>

            <p>The Scout team has implemented a new streamlined process to better leverage warm connections within our network for prospecting existing accounts. Each week, our SDRs will identify key leads they're planning to target and flag potential connections within our leadership team.</p>

            <p><strong>How it works:</strong></p>
            <ul>
                <li>SDRs compile their target leads for the upcoming week in a centralized tracker</li>
                <li>They identify which leaders might have existing relationships with these prospects</li>
                <li>You’ll receive a weekly form (like this one) with the relevant leads for your review</li>
            </ul>

            <p><strong>Your weekly form is here:</strong> <a href="{form_link}">{form_link}</a></p>

            <p>The form contains the names of prospects our team believes you may know or have connections with:</p>
            <ul>{lead_list_html}</ul>

            <p>Please indicate for each lead:</p>
            <ul>
                <li>Whether you know them (and how well)</li>
                <li>Any relevant context that might help our approach</li>
            </ul>

            <p>This should only take 3–5 minutes of your time and will significantly boost our team's success rate with warm outreach.</p>

            <p><strong> Deadline:</strong> Please respond by EOD Sunday so our SDRs can incorporate your input into their weekly planning.</p>

            <p>Thanks for supporting our prospecting efforts — your network connections are invaluable to our growth!</p>

            <p>Best regards,<br><strong>Scout Team</strong><br>MathCo</p>
        </body>
        </html>
        """


        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Weekly Lead Relationship Check - Your Input Needed"
        msg["From"] = SENDER_EMAIL
        msg["To"] = stakeholder_email
        msg.attach(MIMEText(html_body, "html"))

        try:
            with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
                server.starttls()
                server.login(SENDER_EMAIL, SENDER_PASSWORD)
                server.sendmail(SENDER_EMAIL, stakeholder_email, msg.as_string())
                print(f"✅ Email sent to {stakeholder_email}")

            log_rows.append({
                "Email": stakeholder_email,
                "Num_Pending_Leads": len(leads),
                "Lead_Names": ", ".join(leads),
                "Form_Link": form_link,
                "Status": "Success",
                "Timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            })

        except Exception as e:
            print(f"❌ Failed to send to {stakeholder_email}: {str(e)}")
            log_rows.append({
                "Email": stakeholder_email,
                "Num_Pending_Leads": len(leads),
                "Lead_Names": ", ".join(leads),
                "Form_Link": form_link,
                "Status": f"Failed: {str(e)}",
                "Timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            })

    # --- Save Email Log ---
    pd.DataFrame(log_rows).to_csv(LOG_PATH, index=False)
    print(f"\n📄 Email log saved to {LOG_PATH}")

# At the bottom of send_emails.py
def run_email_job():
    main()  # just calls main()

# Only call main() directly if run as script
if __name__ == "__main__":
    main()

