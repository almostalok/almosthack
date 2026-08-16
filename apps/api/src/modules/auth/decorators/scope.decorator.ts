import { SetMetadata } from '@nestjs/common';
import { ScopeType } from '@almosthack/types';


export const SCOPE_KEY = 'scope_contract';

export interface ScopeMetadata {
  type: ScopeType;
  paramName?: string;
}

export function RequireScope(type: ScopeType, paramName?: string) {
  const metadata: ScopeMetadata = { type, paramName };
  return SetMetadata(SCOPE_KEY, metadata);
}
