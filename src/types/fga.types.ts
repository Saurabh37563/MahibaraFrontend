export interface TupleKey {
  user: string;
  relation: string;
  object: string;
}

export interface OpenFGATupleKey {
  user: string;
  relation: string;
  object: string;
}

export interface OpenFGATuple {
  key: OpenFGATupleKey;
  timestamp: string;
}

export interface ReadRequest {
  tuple_key: Partial<OpenFGATupleKey>;
}

export interface WriteRequest {
  writes?: {
    tuple_keys: TupleKey[];
  };
  deletes?: {
    tuple_keys: TupleKey[];
  };
}

export interface RelationshipCheck {
  user: string;
  relation: string;
  object: string;
}

export interface ReadResponse {
  tuples: OpenFGATuple[];
}

export type RelationshipResult = RelationshipCheck & {
  allowed: boolean;
};

export interface FGARelationshipParams {
  userId: string;
  organizationId?: string;
  teamId?: string;
  projectId?: string;
  excelFileId?: string;
  analysisId?: string;
  resultId?: string;
  dataChatId?: string;
}

export interface BatchRelationship {
  user: string;
  relation: string;
  object: string;
}

export interface CheckResponse {
  allowed: boolean;
}

export const mapOpenFGATupleToTupleKey = (tuple: OpenFGATuple): TupleKey => ({
  user: tuple.key.user,
  relation: tuple.key.relation,
  object: tuple.key.object
});
