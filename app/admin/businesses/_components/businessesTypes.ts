export type BusinessItem = {
  id: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  status: string;
  totalJobs: number;
  revenue: number;
  usersCount: number;
  lastLogin: string;
};

export type CreateBusinessForm = {
  companyName: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  tempPassword: string;
  status: boolean;
};

export type UpdateBusinessForm = {
  companyName: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  status: boolean;
};
