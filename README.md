# INSPIRE X Dashboard
[![Ask DeepWiki](https://devin.ai/assets/askdeepwiki.png)](https://deepwiki.com/vashi93/InspireX_Dashboard)

INSPIRE X Dashboard is a comprehensive, role-based event management system built to handle registrations, payment validation, and attendee check-in for the INSPIRE X event. Developed with Next.js and Firebase, it provides a real-time, responsive interface for event administrators and volunteers.

## Key Features

*   **Role-Based Access Control**: Secure login system for three distinct user roles:
    *   **Admin**: Full access to all features, including the main dashboard, registration management, payment validation, and reporting.
    *   **Spot**: Access to a dedicated interface for on-the-spot participant registrations.
    *   **Entry**: Access to a tool for searching participants and issuing event wristbands.

*   **Analytics Dashboard**: The admin dashboard provides a high-level overview of the event's progress with:
    *   A real-time count of total registrations.
    *   A bar chart visualizing daily registration trends.
    *   A sortable table of all registrations with links to payment screenshots.

*   **Registration Management**: Admins can view all participant registrations, categorized into "Vardhaman College," "Other Colleges," and "Spot Registrations." The system allows for viewing detailed participant information and editing records, including the document ID if necessary.

*   **Payment Validation Workflow**: A streamlined interface for admins to validate payments. Each unvalidated registration is presented with participant details, transaction ID, and the uploaded payment screenshot. Admins can approve the registration or mark it as faulty.

*   **Spot Registration**: A simple form for the "Spot" role to quickly register new participants on-site. These registrations are automatically marked as valid.

*   **Wristband Issuance**: An efficient check-in tool for the "Entry" role. Staff can search for participants by Roll Number or Phone Number and mark their wristband as issued. The system includes a reminder to provide a lunch token for specific participant plans.

*   **Data Export**: Admins can download a list of all confirmed participants as an Excel (`.xlsx`) file, categorized by college type.

## Tech Stack

*   **Framework**: [Next.js](https://nextjs.org/) (with App Router)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Backend & DB**: [Firebase](https://firebase.google.com/) (Authentication, Firestore)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
*   **Charting**: [Recharts](https://recharts.org/)
*   **Deployment**: [Firebase App Hosting](https://firebase.google.com/docs/app-hosting)

## Project Structure

The project follows a standard Next.js App Router structure.

```
src
├── app/                  # Pages and layouts for different routes
│   ├── (main)/           # Route group for authenticated pages
│   ├── login/            # Login page
│   └── layout.tsx        # Root layout with sidebar
├── components/           # Reusable components (UI, dashboard elements)
├── context/              # React context (e.g., AuthContext)
├── hooks/                # Custom React hooks (e.g., useToast)
└── lib/                  # Utility functions and Firebase configuration
```
