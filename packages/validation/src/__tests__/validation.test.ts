import {
  idParamSchema,
  flexIdParamSchema,
  paginationQuerySchema,
} from '../common';

describe('Shared Validation Schemas', () => {
  describe('idParamSchema', () => {
    it('should validate valid UUIDs', () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      expect(idParamSchema.safeParse(validUuid).success).toBe(true);
    });

    it('should reject invalid UUIDs', () => {
      expect(idParamSchema.safeParse('not-a-uuid').success).toBe(false);
      expect(idParamSchema.safeParse('').success).toBe(false);
    });
  });

  describe('flexIdParamSchema', () => {
    it('should validate non-empty string IDs within 128 characters', () => {
      expect(flexIdParamSchema.safeParse('usr_12345').success).toBe(true);
      expect(flexIdParamSchema.safeParse('org_test_id').success).toBe(true);
    });

    it('should reject empty or overly long IDs', () => {
      expect(flexIdParamSchema.safeParse('').success).toBe(false);
      expect(flexIdParamSchema.safeParse('a'.repeat(129)).success).toBe(false);
    });
  });

  describe('paginationQuerySchema', () => {
    it('should apply defaults for missing optional fields', () => {
      const result = paginationQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it('should coerce string parameters into numbers', () => {
      const result = paginationQuerySchema.safeParse({ page: '3', limit: '50' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(3);
        expect(result.data.limit).toBe(50);
      }
    });

    it('should reject invalid page or limit values', () => {
      expect(paginationQuerySchema.safeParse({ page: 0 }).success).toBe(false);
      expect(paginationQuerySchema.safeParse({ limit: 101 }).success).toBe(false);
      expect(paginationQuerySchema.safeParse({ page: -5 }).success).toBe(false);
    });
  });
});
