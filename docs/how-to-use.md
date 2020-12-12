---
id: how-to-use
title: How to use
sidebar_label: How to use
---

## npm commands

- **npm start**, start the invoice work server
- **npm run start:dev**, run dev server with the source code
- **npm run build**, build the server and output the files to **dist** folder
- **clean**, remove the **dist** folder

## Server Options

- **feed-url**, sepecifies the endpoint url to retrieve that invoices events data. Default value: http://localhost:9001/invoices/events. Override by calling "**npm start -- --feed-url=http://test.com/**". 
- **invoice-dir**, folder path to save the generated PDF files. Default value: **./invoiceDir**. Override by calling "**npm start -- --invoice-dir=./invoices**".
- **port**, server port number. Default value: **9000**. Override by calling **npm start -- --port=8080**
- **useLocalMockServer**, a flag indicates if a local mock invoices server need to be started for feeding the invoices events. Default value: **true**
- **mockServerPort**, mock server port number. Default value: **9001**
- **fetchFrequence**, cron time string. Default to 10 seconds: 10 * * * * *
- **pageSize**, page size used when fetching the events. Default value: 10.
- **afterEventId**, initial event id to start fetching from. Default value: 0.

## Default Local Mock Server

A mock server for feeding the stub invoices events and can be used for local development.

Endpoint url: http://localhost:9001/invoices/events?pageSize=10&afterEventId=0