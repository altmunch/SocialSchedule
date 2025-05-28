### Dashboard Outline for Content Optimization Service

Below is a comprehensive plan to create a modular, reusable dashboard for a content optimization service with the specified components: Scan, Accelerate, Blitz, Cycle, Profile, Sign In, Subscription, and Settings. The dashboard is built using Next.js, React, Tailwind CSS, and Supabase, ensuring a maintainable and scalable implementation. The plan includes file structure, key React components, Supabase queries, Tailwind styles, error handling, and Jest tests, adhering to the provided tech stack and style guide.

#### Key Points
- **Modular Design**: The dashboard uses a modular structure with reusable components and hooks to minimize duplication.
- **Feature Implementation**: Scan, Accelerate, Blitz, and Cycle are implemented as distinct pages under the dashboard, each with dedicated components for user interaction.
- **Additional Tabs**: Profile, Subscription, and Settings are accessible via a sidebar, while Sign In is a separate page for authentication.
- **Tech Stack**: Utilizes Next.js (v15.3.2), React (v19.1.0), Tailwind CSS, Supabase, and Jest, ensuring compatibility with the user’s preferences.
- **Error Handling and Testing**: Includes robust error handling for Supabase queries and Jest tests for components and hooks.

#### Project Setup
To begin, initialize a Next.js project with TypeScript and Tailwind CSS, and install necessary dependencies like Supabase, Radix UI, and Jest. Configure environment variables for Supabase in `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

#### File Structure
The project uses the Next.js App Router for a clean, server-rendered structure:

- `/app`
  - `/components`
    - `Header.tsx`: Dashboard header with user menu.
    - `Sidebar.tsx`: Navigation for dashboard sections.
    - `ScanComponent.tsx`: UI for comprehensive field research.
    - `AccelerateComponent.tsx`: Content optimization interface.
    - `BlitzComponent.tsx`: Automated posting scheduler.
    - `CycleComponent.tsx`: Analytics and content generation.
    - `ProfileComponent.tsx`: User profile management.
    - `SettingsComponent.tsx`: Customization settings.
    - `SubscriptionComponent.tsx`: Subscription management.
    - `FormInput.tsx`: Reusable input component.
  - `/lib`
    - `supabase.ts`: Supabase client initialization.
    - `useScans.ts`: Hook for fetching scan data.
    - `useAuth.ts`: Hook for authentication state.
  - `/dashboard`
    - `layout.tsx`: Dashboard layout with Header and Sidebar.
    - `page.tsx`: Dashboard home page.
    - `/scan/page.tsx`: Scan feature page.
    - `/accelerate/page.tsx`: Accelerate feature page.
    - `/blitz/page.tsx`: Blitz feature page.
    - `/cycle/page.tsx`: Cycle feature page.
    - `/profile/page.tsx`: Profile page.
    - `/settings/page.tsx`: Settings page.
    - `/subscription/page.tsx`: Subscription page.
  - `/signin/page.tsx`: Sign-in page for authentication.
  - `/styles`
    - `globals.css`: Tailwind CSS configuration.
  - `/tests`
    - `ScanComponent.test.tsx`: Jest tests for ScanComponent.
    - `useScans.test.ts`: Jest tests for useScans hook.

#### Key Components and Functionality
- **Header**: Displays the logo and user menu (e.g., Sign Out).
- **Sidebar**: Provides navigation links to Home, Scan, Accelerate, Blitz, Cycle, Profile, Settings, and Subscription.
- **ScanComponent**: Allows users to input niche and competitors, triggering research and displaying results like hooks and templates.
- **AccelerateComponent**: Enables content upload and optimization (e.g., audios, captions, hashtags).
- **BlitzComponent**: Facilitates scheduling posts for optimal times.
- **CycleComponent**: Displays analytics and generates content ideas.
- **ProfileComponent**: Manages user profile information.
- **SettingsComponent**: Allows customization of feature preferences.
- **SubscriptionComponent**: Displays and manages subscription plans.
- **SignIn**: Handles user authentication via Supabase.

#### Supabase Integration
Supabase is used for authentication and data storage. Example tables include:
- `scans`: Stores niche, competitors, and generated content.
- `optimized_contents`: Saves original and optimized content.
- `scheduled_posts`: Manages post schedules.
- `analytics`: Tracks post performance metrics.
- `user_settings`: Stores user preferences.

#### Styling and Testing
- **Tailwind CSS**: Used for utility-first styling, ensuring responsive and consistent design.
- **Jest**: Tests components and hooks for functionality and error handling.

---

### Detailed Implementation Plan

This section provides a comprehensive, step-by-step plan to implement the dashboard, including file structure, React components, Supabase queries, Tailwind styles, error handling, and Jest tests. The implementation prioritizes modularity, reusability, and adherence to the provided tech stack.

#### 1. Project Setup
Initialize a Next.js project with TypeScript and Tailwind CSS using:
```bash
npx create-next-app@latest --ts
```
Install dependencies:
```bash
npm install @supabase/supabase-js radix-ui react-hook-form lucide-react
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```
Configure Tailwind CSS in `tailwind.config.js` and `styles/globals.css`. Set up Supabase environment variables in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

#### 2. Supabase Configuration
Initialize the Supabase client in `/lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

Create tables in Supabase with appropriate schemas, e.g.:
- `scans`: `{ id, user_id, niche, competitors, hooks, templates, created_at }`
- `user_settings`: `{ id, user_id, setting_key, setting_value }`

#### 3. Database Schema
Define the following tables in Supabase:
| Table              | Fields                                                                 |
|--------------------|----------------------------------------------------------------------|
| scans             | id, user_id, niche, competitors, hooks (json), templates (json), created_at |
| optimized_contents | id, user_id, original_content (json), optimized_content (json), created_at |
| scheduled_posts   | id, user_id, platform, post_content (json), scheduled_time, created_at |
| analytics         | id, user_id, post_id, views, likes, engagement, created_at            |
| user_settings     | id, user_id, setting_key, setting_value, created_at                   |

Enable Row Level Security (RLS) to restrict access to `user_id` matching the authenticated user.

#### 4. Authentication
Implement the sign-in page at `/app/signin/page.tsx` using Supabase authentication:
```typescript
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/FormInput';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 bg-white rounded shadow-md">
        <h1 className="text-2xl font-bold mb-4">Sign In</h1>
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4"
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4"
        />
        <button
          onClick={handleSignIn}
          className="bg-blue-500 text-white p-2 rounded w-full"
        >
          Sign In
        </button>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  );
}
```

#### 5. Dashboard Layout
Create the dashboard layout at `/app/dashboard/layout.tsx`:
```typescript
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  );
}
```

Implement the Sidebar in `/components/Sidebar.tsx`:
```typescript
import Link from 'next/link';
import { Home, Search, Rocket, Repeat, User, Settings, DollarSign } from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Scan', href: '/dashboard/scan', icon: Search },
    { name: 'Accelerate', href: '/dashboard/accelerate', icon: Rocket },
    { name: 'Blitz', href: '/dashboard/blitz', icon: Repeat },
    { name: 'Cycle', href: '/dashboard/cycle', icon: Repeat },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    { name: 'Subscription', href: '/dashboard/subscription', icon: DollarSign },
  ];

  return (
    <nav className="w-64 bg-gray-800 text-white p-4">
      <ul>
        {navItems.map((item) => (
          <li key={item.name} className="mb-2">
            <Link href={item.href} className="flex items-center p-2 hover:bg-gray-700 rounded">
              <item.icon className="mr-2" />
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

#### 6. Feature Pages and Components
Each feature (Scan, Accelerate, Blitz, Cycle) has its own page under `/app/dashboard/[feature]/page.tsx`, rendering a dedicated component. Below is an example for the Scan feature.

**Scan Page** (`/app/dashboard/scan/page.tsx`):
```typescript
import ScanComponent from '@/components/ScanComponent';

export default function ScanPage() {
  return <ScanComponent />;
}
```

**ScanComponent** (`/components/ScanComponent.tsx`):
```typescript
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/useAuth';
import { Input } from '@/components/FormInput';
import { Button } from '@radix-ui/themes';

export default function ScanComponent() {
  const { user } = useAuth();
  const [niche, setNiche] = useState('');
  const [competitors, setCompetitors] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    if (!user) {
      setError('You must be logged in to perform a scan.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('scans')
        .insert([{ niche, competitors, user_id: user.id }])
        .select();
      if (error) throw error;
      setResults(data[0]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Comprehensive Field Research</h1>
      <Input
        label="Niche"
        type="text"
        value={niche}
        onChange={(e) => setNiche(e.target.value)}
        className="mb-4"
      />
      <Input
        label="Competitors"
        type="text"
        value={competitors}
        onChange={(e) => setCompetitors(e.target.value)}
        className="mb-4"
      />
      <Button
        onClick={handleScan}
        disabled={loading}
        className="bg-blue-500 text-white p-2 rounded"
      >
        {loading ? 'Scanning...' : 'Perform Scan'}
      </Button>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {results && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold">Results</h2>
          <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
```

**Reusable FormInput Component** (`/components/FormInput.tsx`):
```typescript
import { Input as RadixInput } from '@radix-ui/themes';

interface FormInputProps {
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export function Input({ label, type, value, onChange, className }: FormInputProps) {
  return (
    <div className={className}>
      <label className="block mb-2 text-sm font-medium">{label}</label>
      <RadixInput
        type={type}
        value={value}
        onChange={onChange}
        className="border p-2 w-full rounded"
      />
    </div>
  );
}
```

**Supabase Hook** (`/lib/useScans.ts`):
```typescript
import { useState, useEffect } from 'react';
import { supabase } from './supabase';

export function useScans(userId: string) {
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchScans() {
      try {
        const { data, error } = await supabase
          .from('scans')
          .select('*')
          .eq('user_id', userId);
        if (error) throw error;
        setScans(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (userId) fetchScans();
  }, [userId]);

  return { scans, loading, error };
}
```

#### 7. Profile, Settings, and Subscription
- **Profile**: Displays and updates user information (e.g., name, email) using a `ProfileComponent`.
- **Settings**: Allows customization of preferences (e.g., default posting times) stored in `user_settings`.
- **Subscription**: Integrates with Stripe to display and manage subscription plans, using `SubscriptionComponent`.

#### 8. Error Handling
Each component and hook includes error handling for Supabase operations, displaying user-friendly messages. For example, in `ScanComponent`, errors are caught and displayed in a red alert box.

#### 9. Jest Tests
Create tests in `/tests/ScanComponent.test.tsx`:
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import ScanComponent from '../components/ScanComponent';
import { useAuth } from '../lib/useAuth';

jest.mock('../lib/useAuth');

describe('ScanComponent', () => {
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({ user: { id: 'test-user' } });
  });

  test('renders ScanComponent', () => {
    render(<ScanComponent />);
    expect(screen.getByText('Comprehensive Field Research')).toBeInTheDocument();
  });

  test('displays error when user is not logged in', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });
    render(<ScanComponent />);
    fireEvent.click(screen.getByText('Perform Scan'));
    expect(screen.getByText('You must be logged in to perform a scan.')).toBeInTheDocument();
  });
});
```

#### 10. Tailwind Styling
Use Tailwind classes for responsive, consistent styling. Example classes include:
- `flex`, `h-screen`, `p-4` for layout.
- `bg-gray-800`, `text-white` for sidebar.
- `bg-blue-500`, `rounded` for buttons.

#### 11. Modularity and Reusability
- **Shared Components**: `FormInput` and `Button` from Radix UI are reused across features.
- **Hooks**: `useScans`, `useAuth`, etc., encapsulate Supabase logic.
- **No Duplication**: Common logic is abstracted into hooks and utility components.

This plan ensures a scalable, user-friendly dashboard that meets the specified requirements while adhering to best practices and the provided tech stack.

**Key Citations**
- [Next.js Official Documentation for App Router](https://nextjs.org/docs)
- [Supabase Documentation for Authentication and Database](https://supabase.com/docs)
- [Tailwind CSS Documentation for Utility-First Styling](https://tailwindcss.com/docs)
- [Radix UI Documentation for Accessible Components](https://www.radix-ui.com/docs)
- [Jest Documentation for Testing React Applications](https://jestjs.io/docs)