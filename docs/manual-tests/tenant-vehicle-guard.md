Manual test: tenant guard for vehicle mutations
==============================================

Goal
----
Confirm that users scoped to one tenant cannot update or suspend vehicles that belong to a different tenant.

Prerequisites
-------------
- Local environment with Supabase running and seeded vehicles for at least two tenants (for example, chile and peru).
- hosts file entries mapping chile.localhost and peru.localhost to 127.0.0.1 so Vite can simulate subdomains.
- Frontend dev server running from the app directory via `npm install` and `npm run dev -- --host`.

Steps
-----
1. Open http://peru.localhost:5173 in a browser. Verify at least one vehicle shows in the UI and confirm in Supabase that its `tenant_id` is peru.
2. Note the `id` of that peru vehicle from Supabase (Table editor -> vehicles).
3. In a second tab, open http://chile.localhost:5173 to scope the session to the chile tenant.
4. In the DevTools console of the chile tab, run:

   ```ts
   import { vehicleService } from '/src/services/vehicleService'
   await vehicleService.updateVehicle('<vehicle-id-from-peru>', { price: 9999 })
   ```

   The promise resolves with `{ vehicle: null, error: PostgrestError }` and the error message contains `Row not found`.
5. Repeat with the delete path:

   ```ts
   await vehicleService.deleteVehicle('<vehicle-id-from-peru>')
   ```

   The promise rejects with the same `Row not found` error and the record remains `active` in the database.
6. Confirm in Supabase (Table editor -> vehicles) that the row keeps its original data and timestamps.

Expected outcome
----------------
Both operations fail because the service now adds the tenant filter (`tenant_id = currentTenant`) before performing the mutation, preventing cross-tenant updates.

Notes
-----
If the console import is unavailable due to module scoping, temporarily expose the service in `src/main.ts` (for example `window.vehicleService = vehicleService`) to execute the calls and remove it afterwards.
