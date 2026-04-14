// Task Template
export interface Template {
  id: string;
  name: string;
  description?: string;
  stages: string[];
  tags: string[];
  defaultPriority?: string;
  createdAt: string;
  updatedAt?: string;
}

// Create Template Data
export interface CreateTemplateData {
  name: string;
  description?: string;
  stages: string[];
  tags: string[];
  defaultPriority?: string;
}
