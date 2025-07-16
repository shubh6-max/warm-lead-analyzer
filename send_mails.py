import os
import smtplib
import pandas as pd
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from supabase import create_client, Client

# === CONFIG ===
SUPABASE_URL = "https://vxigtrpkjyrxsalbdxwv.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4aWd0cnBranlyeHNhbGJkeHd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NjA3MjMsImV4cCI6MjA2ODIzNjcyM30.0jI6MlT9C4iQ0kyPDAZ6sKbV1x8l572y_E7tPTMsyIY"
SUPABASE_TABLE = "leads_with_status"

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = "trailerbuddy96@gmail.com"  # store in GitHub Secrets or .env
SENDER_PASSWORD = "whcy thim nsft kjcy"

BASE_FORM_URL = "https://warm-lead-whisperer-survey.vercel.app/"

# === Connect to Supabase ===
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def main():
    try:
        # --- Fetch Leads with "Not Done" status ---
        response = supabase.table(SUPABASE_TABLE).select("*").eq("Status", "Not Done").execute()
        records = response.data
        if not records:
            print("✅ No pending leads to send.")
            return
    except Exception as e:
        print(f"❌ Error fetching from Supabase: {e}")
        return

    # --- Group Leads by Stakeholder Email ---
    email_map = {}
    for row in records:
        lead_name = row.get("Target Lead Name")
        raw_emails = row.get("Leadership contact email", "")
        for email in str(raw_emails).split(";"):
            email = email.strip().lower()
            if email not in email_map:
                email_map[email] = []
            email_map[email].append(lead_name)

    # --- Send Emails ---
    log_rows = []
    for stakeholder_email, leads in email_map.items():
        if not leads:
            continue

        form_link = f"{BASE_FORM_URL}/?email={stakeholder_email}"
        lead_list_html = "".join(f"<li>{lead}</li>" for lead in leads)

        html_body = f"""
        <html>
        <body>
            <p>Hi {stakeholder_email},</p>
            <p>Please help us by rating your relationship strength with the following leads:</p>
            <ul>{lead_list_html}</ul>
            <p>👉 <a href="{form_link}">Click here to open your form</a></p>
            <p>Thank you!</p>
        </body>
        </html>
        """

        msg = MIMEMultipart("alternative")
        msg["Subject"] = "📝 Warm Outreach - Your Action Needed"
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

    # --- Log Summary (optional to CSV or Supabase log table) ---
    pd.DataFrame(log_rows).to_csv("email_log.csv", index=False)
    print(f"\n📄 Email log saved to email_log.csv")

def run_email_job():
    main()

if __name__ == "__main__":
    main()
