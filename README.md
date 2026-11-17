# Next.js template

This is a Next.js template with shadcn/ui.

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button";
```





---------website---------
## Navber requierment
Logo & Brand Name: MentorLagbe (keep the heading/logo the same style and size as on the home page).
Public Navigation Items: Home (/), Browse Tuitions (/tuitions), Pricing / Pro Plans (/pricing), and How It Works / About.
Navbar State for Unauthenticated Users: Show 'Sign In' and 'Sign Up' buttons.
Navbar State for Authenticated Users: Display User Profile Image (Avatar), User Name & Role Badge (Student / Tutor / Admin), 'Dashboard' link, 'Update Profile' link, and a 'Sign Out' button.
