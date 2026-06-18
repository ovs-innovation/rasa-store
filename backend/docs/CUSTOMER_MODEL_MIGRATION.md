# Customer Model Migration — Legacy B2B → RASA B2C

## Target schema (RASA customer)

```js
{
  name, email, phone, image, address, country, city,
  shippingAddress[], password, authProvider, firebaseUid,
  phoneVerified, profileComplete, emailVerified, pendingEmail,
  emailVerificationOtp, emailVerificationExpires,
  loginOtp, loginOtpExpires, loginOtpAttempts, lastLoginOtpSentAt,
  lastLogin, blocked, cart[], fcmToken,
}
```

## Removed fields (Phase 2A.5)

| Field | Reason |
|-------|--------|
| `role` (wholesaler enum) | B2B removed — all users are customers |
| `aadhar`, `pan`, `gst`, `drugLicense` + PublicId/DeleteToken | Pharmacy wholesaler KYC |
| `gstNotRequired`, `drugLicenseNotRequired` | Wholesaler signup |
| `hasShop`, `shopName`, `gstNumber`, `drugLicenseNumber` | B2B business |
| `shopImageUrl`, `businessDocUrl` + tokens | B2B documents |
| `wholesalerStatus` | B2B approval flow |
| `credentialEmailCount`, `lastCredentialEmailSentAt` | Wholesaler credentials |

## Run migration (after Atlas IP whitelist)

```bash
node backend/script/migrateRemoveB2BCustomerFields.js
```

This script:

1. Sets `role: "customer"` on any document that had `role: "wholesaler"`
2. `$unset` all removed fields listed above

## Rollback

Not supported — back up MongoDB before running.
