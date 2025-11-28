export type Table<Data, Relationships extends Relationship[] = []> = {
	Row: Data & TableDataBase;
	Insert: Partial<Data & TableDataBase>;
	Update: Partial<Data & TableDataBase>;
	Relationships: Relationships;
};

export type View<Data, Relationships extends Relationship[] = []> = {
	Row: Data & ViewDataBase;
	Relationships: Relationships;
};

type TableDataBase = {
	id: string;
	created_at: string;
	updated_at: string;
};

type ViewDataBase = {
	id: string;
	updated_at: string;
};

type Relationship = {
	foreignKeyName: string; // Default in Supabase is <table_name>_<column_name>_fkey
	columns: string[]; // Column(s) in table
	isOneToOne: boolean;
	referencedRelation: string; // Foreign table
	referencedColumns: string[]; // Column(s) in foreign table
};
