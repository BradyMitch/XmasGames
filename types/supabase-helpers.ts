export type Table<Data, Relationships extends Relationship[] = [], IDType = number> = {
	Row: Data & TableDataBase<IDType>;
	Insert: Partial<Data & TableDataBase<IDType>>;
	Update: Partial<Data & TableDataBase<IDType>>;
	Relationships: Relationships;
};

export type View<Data, Relationships extends Relationship[] = []> = {
	Row: Data & ViewDataBase;
	Relationships: Relationships;
};

type TableDataBase<IDType> = {
	id: IDType;
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
