---
mode: 'agent'
model: Claude Haiku 4.5 (copilot)
description: 'Upsert a supabase type'
---
Your goal is to upsert a supabase type into the correct location under `types/` based on a provided type from supabase and the existing type definitions under `types/`.

The type will either be an enum, function, table, or view. Theses types are defined in either `types/enums/`, `types/functions/`, `types/tables/`, or `types/views/`, and file and type names should be in pascal case. Types are imported and configured for supabase in `types/supabase.ts`.

Supabase provides a type definition for the enum, function, table, or view which you must use to create the corresponding TypeScript type in the appropriate file.

If the enum, function, table, or view type already exists, you must update it to match the provided supabase type definition.

Order table and view columns in a logical manner, grouping related fields together, foreign keys near the top, and placing optional fields at the end.

Note that table and view types in the codebase use a base Table type from `types/supabase-helpers.ts` which includes the id, created_at, and updated_at fields. You must not re-define these fields in the table or view type definitions.

If you come across a ts_vector type from supabase, you must define it as `unknown | null` in the TypeScript type definition.

If the supabase provided type is not provided, you must ask for the missing information before proceeding.
