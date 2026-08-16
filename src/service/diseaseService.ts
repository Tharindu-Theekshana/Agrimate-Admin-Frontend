import { api } from '@/api/api';

export const diseaseApi = {
  list: () => api.get<{ diseaseKey: string; nameEn: string }[]>('/api/diseases').then((r) => r.data),
};
