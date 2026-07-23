# Avodah Operations Hub

This repository is being initialized as the controlled source and deployment entry point for the Avodah Operations Hub TEST Apps Script project.

## Current TEST target

- Apps Script project ID: `1zY0oLLW9_MtXdPvRmyBci2TMnBnCwM6bbjXIMnK9-sSs4iaSmX41oZYO`
- Existing TEST deployment ID: `AKfycby53XUeA6NcCQt447OfYt1te6h-FOUSEIIFKM9XYoal4RYhwf0m5gRI1Ly7PnWYB9TS`
- Target hardened release: `TEST v1.1.1`
- Production is out of scope for this workflow.

## Safety

The deployment workflow is manual (`workflow_dispatch`) and targets only the recorded TEST Apps Script project/deployment. Authentication must be supplied through the GitHub environment secret `CLASPRC_JSON`. Do not commit `.clasprc.json`, OAuth refresh tokens, `WEBHOOK_SECRET`, or other credentials.

The workflow expects Apps Script source files under `src/` and will not proceed unless the required manifest and core modules are present.

## Current hardening scope

TEST v1.1.1 removes management bearer URLs from Calendar descriptions, revokes management-token hashes on cancellation/reconciliation, limits public management status data, and adds regression assertions for the exposure.
