---
id: overview
title: Overview
sidebar_label: Overview
---

![test](/img/flowchart.png)

- **Xero Invoice Worker** periodically pulling the **/invoices/events** end point.
- **events** payload are returned in **json** format.
- **Xero Invoice Worker** process the payload, **CREATE/UPDATE/DELETE** **PDFs** accordingly.
- **PDFs** files are persisted in the invoices folder, which can be specified when start the **Xero Invoice Worker**
