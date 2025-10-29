# Subay

**Subay** (a Cebuano word meaning "to trace or follow a path") is an application designed to help users track time, manage tasks, and document the daily cadence of their emotions. Essentially, it functions as a comprehensive **journaling app and task tracker.**

## Design Acknowledgment

The User Interface (UI) and animation elements within this application are profoundly inspired by and reference the work of **Joi Planner and Left**. Full credit is extended to the original creators, and this work is not claimed as original. This project was undertaken strictly as a technical exercise to explore and implement design replication within the **React Native** cross-platform framework.

## Getting Started

Before running **Subay**, please complete the following setup steps:

1.  **Clerk Account Setup:**
    * [Set up your Clerk account](https://go.clerk.com/blVsQlm).
    * In the instance setup, maintain the default option selected: **Email, phone, username**.
    * Enable Apple, GitHub, and Google as sign-in options under **SSO Connections**.
2.  **Environment Configuration:**
    * Rename the file `.env.example` to `.env.local`.
    * Paste your `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` from [your API keys](https://go.clerk.com/u8KAui7) into the new `.env.local` file.

**Note:** This is a local-first application. Database setup is not required solely for exploring the application's features.

### Running the Development Server

Start the application by running the following commands:

```bash
bun i
bun run dev