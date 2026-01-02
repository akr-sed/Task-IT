## Overview

```
Users ──────┬──► owns Projects ──┬──► Tasks (comments live inside)
            │                    ├──► Invites (expire after 30 days)
            └──► member of ──────┘
                                 └──► Logs (notifications)

Users also have:
├── Sessions (login tokens 30-day expiry)
├── Codes (verification stuff expires in 10min)
└── TempUsers (people who haven t verified email yet)
```