---
agent: agent
model: Claude Haiku 4.5 (copilot)
description: 'Upsert a supabase type by name'
---
Your goal is to upsert a supabase type into the correct location under `types/` by looking it up from the MCP server.

## Input
You will be provided with the name of a Table, View, Enum, or Function (e.g., "profile", "variety", "Role", "get_requester_role").

## Process
1. Use the MCP Supabase connection to look up the type definition:
   - For tables/views: use `mcp_supabase_list_tables` to find the table schema
   - For enums: look in the table column definitions or use the database metadata
   - For functions: use `mcp_supabase_list_edge_functions` to find function definitions
2. Generate the appropriate TypeScript type definition based on the database schema
3. Create or update the type file in the correct location:
   - Enums → `types/enums/{PascalCaseName}.ts`
   - Functions → `types/functions/{PascalCaseName}.ts`
   - Tables → `types/tables/{PascalCaseName}.ts`
   - Views → `types/views/{PascalCaseName}.ts`
4. Update `types/supabase.ts` to import and register the type if it's new

## Guidelines
- File and type names should be in PascalCase
- Order table and view columns logically: foreign keys near the top, then data fields, optional fields at the end
- Table and view types use a base `Table`/`View` type from `types/supabase-helpers.ts` which includes `id`, `created_at`, and `updated_at` fields—do not redefine these
- For `tsvector` columns, use `unknown | null` in the type definition
- For empty enums/functions/views in `types/supabase.ts`: use `{}` (not `Record<string, unknown>` or `Record<string, never>`) You may biome ignore the warning about empty object types. We need this or Supabase will error
- Include foreign key relationships in the Relationships array with proper metadata

## Formatting Examples

### Enum Example
```typescript
// types/enums/MyEnum.ts
export type MyEnum = "value1" | "value2" | "value3";
```

### Table Example
```typescript
// types/tables/MyTable.ts
import type { SomeEnum } from "../enums/SomeEnum";
import type { Table } from "../supabase-helpers";

export type MyTable = Table<
	{
		foreign_id: string;
		name: string;
		description: string | null;
		status: SomeEnum;
		is_active: boolean;
	},
	[
		{
			foreignKeyName: "my_table_foreign_id_fkey";
			columns: ["foreign_id"];
			isOneToOne: false;
			referencedRelation: "other_table";
			referencedColumns: ["id"];
		},
	]
>;
```

### View Example
```typescript
// types/views/MyView.ts
import type { View } from "../supabase-helpers";

export type MyView = View<
	{
		field1: string;
		field2: number | null;
		field3: boolean;
	},
	[]
>;
```

### Function Example
```typescript
// types/functions/MyFunction.ts
export type MyFunction = {
	Args: {
		param1: string;
		param2: number;
	};
	Returns: {
		result: string;
		count: number;
	};
};
```

## Output
Create or update the TypeScript type file and ensure it's properly imported in `types/supabase.ts`.
