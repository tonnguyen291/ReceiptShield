# ReceiptShield

ReceiptShield is an intelligent, serverless expense management system built with Next.js, Firebase, and Google's Gemini AI models via Genkit. It provides secure, role-based handling of digital receipts, leveraging AI for data extraction and fraud detection.

---

### Key Features

#### For Employees
- **AI-Powered Receipt Upload**: Submit receipts (images or PDFs) and let AI automatically extract key details like vendor, date, and total amount.
- **Verification Workflow**: Review and correct AI-extracted data before final submission.
- **Submission History**: View a comprehensive history of all submitted receipts and their current status (Pending, Approved, Rejected, Flagged).
- **AI Assistant**: A built-in chatbot to answer questions about expense policies and receipt statuses.

#### For Managers
- **Team Dashboard**: An overview of team-wide expense analytics, including monthly trends.
- **Flagged Receipt Queue**: A dedicated view to review, approve, or reject receipts flagged by the AI for potential fraud.
- **Detailed Employee View**: See all receipt submissions for each team member.
- **Report Generation**: Generate detailed CSV and PDF expense reports for the entire team or for individual employees.

#### For Administrators
- **Global Dashboard**: A high-level view of company-wide analytics, including total expenses, all submissions, and global fraud alerts.
- **Advanced User Management**: A complete interface to manage all users.
  - **Edit User Details**: Modify a user's name, email, and role.
  - **Change Roles**: Promote employees to managers with protective warnings for irreversible actions.
  - **Deactivate/Reactivate Users**: Securely manage user access by deactivating and reactivating accounts.
  - **Reassign Supervisors**: Easily change the reporting structure by assigning employees to different managers.
  - **Admin Protection**: Admins are prevented from deactivating other admins to ensure system integrity.

---

## 🛠️ Tech Stack

- **Framework**: Next.js & React with TypeScript
- **UI**: ShadCN UI Components & Tailwind CSS
- **Authentication**: Custom hook-based auth managing roles in Local Storage
- **AI**: Google AI & Genkit for:
  - `gemini-2.0-flash`: Receipt summarization & fraud analysis
  - `gemini-2.0-flash`: AI assistant chatbot
- **Local Data Store**: React Context and Local Storage (`localStorage`) to simulate a database for users and receipts.
- **Deployment**: Configured for Firebase App Hosting

---

## ⚙️ Project Structure

/src
├── app          # Next.js App Router (pages and layouts)
├── components   # Shared and role-specific React components
├── contexts     # Global state management (e.g., AuthContext)
├── ai           # Genkit flows for AI functionality
├── lib          # Core logic, utilities, and data stores
└── types        # TypeScript type definitions
/public          # Static assets
package.json     # Project dependencies
next.config.ts   # Next.js configuration
tailwind.config.ts # Tailwind CSS configuration
apphosting.yaml  # Firebase App Hosting configuration
