# Supabase OAuth Configuration Guide

To enable Google and GitHub sign-in for the ThreatLens dashboard, you need to configure the OAuth providers in your Supabase project. The frontend code is already fully set up to handle the logins via the `signInWithOAuth` function.

Here is the step-by-step guide to configuring both providers:

---

## 1. Configure GitHub Sign-In

### A. Get GitHub Credentials
1. Go to your GitHub account settings.
2. Navigate to **Developer settings** (at the bottom of the left sidebar).
3. Click on **OAuth Apps** -> **New OAuth App**.
4. Fill in the application details:
   - **Application name:** `ThreatLens SOC` (or your preferred name)
   - **Homepage URL:** `http://localhost:5173` (For local testing) or your production domain.
   - **Authorization callback URL:** `https://<your-supabase-project-id>.supabase.co/auth/v1/callback`
     *(You can find your Supabase Project ID in the Supabase Dashboard under Project Settings -> API).*
5. Click **Register application**.
6. On the next screen, copy your **Client ID**.
7. Click **Generate a new client secret** and copy the **Client Secret**.

### B. Add Credentials to Supabase
1. Go to your [Supabase Dashboard](https://app.supabase.com/).
2. Select your project.
3. In the left sidebar, click on **Authentication** -> **Providers**.
4. Click on **GitHub** and toggle **Enable GitHub**.
5. Paste the **Client ID** and **Client Secret** you got from GitHub.
6. Click **Save**.

---

## 2. Configure Google Sign-In

### A. Get Google Credentials
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. In the left sidebar, navigate to **APIs & Services** -> **Credentials**.
4. If you haven't configured the OAuth consent screen yet, click **Configure Consent Screen**, choose **External**, and fill in the required App Name and Support Email.
5. Back in **Credentials**, click **Create Credentials** -> **OAuth client ID**.
6. Select **Web application** as the application type.
7. Name it something like `ThreatLens Web`.
8. Under **Authorized redirect URIs**, add your Supabase callback URL:
   `https://<your-supabase-project-id>.supabase.co/auth/v1/callback`
9. Click **Create**.
10. Copy your **Client ID** and **Client Secret** from the modal that appears.

### B. Add Credentials to Supabase
1. Go back to your [Supabase Dashboard](https://app.supabase.com/).
2. Select your project and navigate to **Authentication** -> **Providers**.
3. Click on **Google** and toggle **Enable Google**.
4. Paste the **Client ID** and **Client Secret** you got from Google Cloud.
5. Click **Save**.

---

## 3. Update Frontend Environment Variables

For the frontend to communicate with Supabase, you must ensure that your Supabase URL and Anon Key are set in your local environment.

Open `frontend/.env` and fill in the following values (found in Supabase under **Project Settings** -> **API**):

```env
# Supabase Cloud Project Configuration
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=ey... (your anon public key)
```

After updating these variables, restart your frontend server for the changes to take effect!
