import { request as umiRequest } from '@umijs/max';

export async function request<T>(
  url: string,
  options: any = { method: 'GET' },
): Promise<T | undefined> {
  if (!options['throwError']) {
    try {
      const resp: any = await umiRequest(url, options);
      return resp.data;
    } catch (ex) {
      return undefined;
    }
  }
  const resp: any = await umiRequest(url, options);
  return resp.data;
}

export function convertPageData(result: any) {
  return {
    data: result?.list || [],
    total: result?.total || 0,
    success: true,
  };
}
export function orderBy(sort: Record<string, 'ascend' | 'descend'> | undefined | null): string | undefined {
  if (!sort) return undefined;
  const keys = Object.keys(sort);
  if (keys.length !== 1) return undefined;
  
  const key = keys[0];
  const direction = sort[key];
  
  if (!direction) return undefined; // Handle case where direction might be missing
  
  const sqlDirection = direction === 'ascend' ? 'ASC' : 'DESC';
  
  // --- Add Mapping for known mismatches ---
  let backendKey = key;
  if (key === 'updatedAt') {
      backendKey = 'updated_at';
  } else if (key === 'createdAt') {
      backendKey = 'created_at';
  } else if (key === 'itemNumber') {
      backendKey = 'item_number';
  } else if (key === 'stockQuantity') {
      backendKey = 'stock_quantity';
  } else if (key === 'operatorName') {
      // operatorName is derived in the backend VO, not a direct column.
      // Sorting by operatorName requires joining with the admin table in the backend SQL.
      // For now, disable sorting for this column to avoid errors.
      console.warn('Sorting by operatorName is not directly supported by the current backend query.');
      return undefined; 
  }
  // Add more mappings here if needed for other columns (e.g., stockQuantity -> stock_quantity)
  // --- End Mapping ---

  // Basic validation to prevent SQL injection - ensure key is alphanumeric/underscore
  // Apply validation to the *backendKey* now
  if (!/^[a-zA-Z0-9_]+$/.test(backendKey)) {
      console.error(`Invalid sort key detected (after mapping): ${backendKey}. Skipping sort.`);
      return undefined;
  }
  
  return `${backendKey} ${sqlDirection}`;
}

export async function waitTime(time: number = 100) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
}
