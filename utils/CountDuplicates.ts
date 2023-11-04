interface DataItem {
  userId?: string;
  url: string;
  count: number;
}

export const countDuplicatesByUser = (data: DataItem[]) => {
  const countMap = new Map<string, number>();

  data.forEach((item) => {
    const key = `${item.userId}_${item.url}`;
    if (countMap.has(key)) {
      countMap.set(key, countMap.get(key)! + 1);
    } else {
      countMap.set(key, 1);
    }
  });

  const duplicates: DataItem[] = [];
  countMap.forEach((count, key) => {
    if ((count) => 1) {
      const [userId, url] = key.split("_");
      duplicates.push({ userId, url, count });
    }
  });

  return duplicates;
};

export const countDuplicates = (data: DataItem[]) => {
  const countMap = new Map<string, number>();

  data.forEach((item) => {
    const key = `${item.url}`;
    if (countMap.has(key)) {
      countMap.set(key, countMap.get(key)! + 1);
    } else {
      countMap.set(key, 1);
    }
  });

  const duplicates: DataItem[] = [];
  countMap.forEach((count, key) => {
    if ((count) => 1) {
      duplicates.push({ key, count });
    }
  });

  return duplicates;
};
