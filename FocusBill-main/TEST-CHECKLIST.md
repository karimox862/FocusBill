# Quick Test - What's Actually Broken?

Please test each item and tell me YES or NO:

## 1. Overview Page (when you first open dashboard):
- Q: Do you see "Dashboard Overview" as the title? YES/NO
- Q: Do you see 4 stat cards (Hours, Sessions, Revenue, Active Days)? YES/NO
- Q: Is there an export button at the top right? (should be GONE) YES/NO
- Q: Are there two broken charts showing? (should be GONE) YES/NO

## 2. Time Logs Page (Sessions):
- Q: Click on a session's delete button (<img src="icons/trash.png" alt="Trash Icon" style="width: 16px; height:auto" />), does anything happen? YES/NO
- Q: Do you get a confirmation dialog? YES/NO
- Q: Does the session actually delete? YES/NO

## 3. Clients Page:
- Q: Click edit button (✏️) on a client, do you get a prompt? YES/NO
- Q: Click delete button (<img src="icons/trash.png" alt="Trash Icon" style="width: 16px; height:auto" />), do you get confirmation? YES/NO
- Q: Does delete actually work? YES/NO

## 4. Invoices Page:
- First: Go to Settings → scroll to Payment Integration
- Q: Do you see "Stripe Payment Link" field? YES/NO
- Q: Do you see "PayPal.Me Link" field? YES/NO
- Enter test links:
  - Stripe: https://buy.stripe.com/test123
  - PayPal: https://paypal.me/testuser
- Go back to Invoices → Generate invoice
- Q: Does invoice open in new tab? YES/NO
- Q: Do you see Stripe button (purple "Pay with Card")? YES/NO
- Q: Do you see PayPal button (blue "Pay with PayPal")? YES/NO

## 5. Expenses Page:
- Q: Click "+ Add Expense" button, does alert appear? YES/NO

## 6. Notes Page:
- Q: Click "+ New Note", does modal appear? YES/NO
- Q: Can you type in the textarea? YES/NO
- Q: Click "Save Note", does it save? YES/NO

---

Please answer these questions so I know EXACTLY what's broken!
