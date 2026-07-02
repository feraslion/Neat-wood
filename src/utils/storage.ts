// Transparent partition for localStorage to isolate user accounts data.
// This executes early and overrides Storage prototype methods.

const GLOBAL_KEYS = [
  "workspace_users",
  "workspace_remember_me",
  "workspace_last_user",
  "workspace_active_user",
  "workspace_language"
];

// Helper to get active user
const getActiveUser = (): string => {
  if (typeof window === "undefined") return "";
  try {
    const originalGetItem = Storage.prototype.getItem;
    const activeUserStr = originalGetItem ? originalGetItem.call(window.localStorage, "workspace_active_user") : window.localStorage.getItem("workspace_active_user");
    if (activeUserStr) {
      const u = JSON.parse(activeUserStr);
      return u?.username || "";
    }
  } catch {}
  return "";
};

// Helper to get partitioned key
const getPartitionedKey = (key: string): string => {
  if (GLOBAL_KEYS.includes(key)) return key;
  if (key.startsWith("user_")) {
    const username = getActiveUser();
    if (username && key.startsWith(`user_${username}_`)) {
      return key;
    }
  }
  const username = getActiveUser();
  if (username) {
    return `user_${username}_${key}`;
  }
  return key;
};

// Define explicit wrapper
export const safeStorage = {
  getItem(key: string): string | null {
    if (typeof window === "undefined") return null;
    const targetKey = getPartitionedKey(key);
    const originalGetItem = (Storage.prototype as any)._originalGetItem || Storage.prototype.getItem;
    return originalGetItem.call(window.localStorage, targetKey);
  },

  setItem(key: string, value: string): void {
    if (typeof window === "undefined") return;
    const targetKey = getPartitionedKey(key);
    const originalSetItem = (Storage.prototype as any)._originalSetItem || Storage.prototype.setItem;
    originalSetItem.call(window.localStorage, targetKey, value);
  },

  removeItem(key: string): void {
    if (typeof window === "undefined") return;
    const targetKey = getPartitionedKey(key);
    const originalRemoveItem = (Storage.prototype as any)._originalRemoveItem || Storage.prototype.removeItem;
    originalRemoveItem.call(window.localStorage, targetKey);
  },

  clear(): void {
    if (typeof window === "undefined") return;
    const username = getActiveUser();
    if (!username) {
      const originalClear = (Storage.prototype as any)._originalClear || Storage.prototype.clear;
      originalClear.call(window.localStorage);
      return;
    }
    const prefix = `user_${username}_`;
    const keysToRemove: string[] = [];
    const originalKey = (Storage.prototype as any)._originalKey || Storage.prototype.key;
    const originalRemoveItem = (Storage.prototype as any)._originalRemoveItem || Storage.prototype.removeItem;
    
    for (let i = 0; ; i++) {
      const rawKey = originalKey.call(window.localStorage, i);
      if (rawKey === null) break;
      if (rawKey.startsWith(prefix)) {
        keysToRemove.push(rawKey);
      }
    }
    keysToRemove.forEach(k => originalRemoveItem.call(window.localStorage, k));
  },

  key(index: number): string | null {
    if (typeof window === "undefined") return null;
    const username = getActiveUser();
    const prefix = username ? `user_${username}_` : "";
    const visibleKeys: string[] = [];
    const originalKey = (Storage.prototype as any)._originalKey || Storage.prototype.key;
    
    for (let i = 0; ; i++) {
      const rawKey = originalKey.call(window.localStorage, i);
      if (rawKey === null) break;
      if (GLOBAL_KEYS.includes(rawKey)) {
        visibleKeys.push(rawKey);
      } else if (prefix && rawKey.startsWith(prefix)) {
        visibleKeys.push(rawKey.substring(prefix.length));
      } else if (!username && !rawKey.startsWith("user_")) {
        visibleKeys.push(rawKey);
      }
    }
    return visibleKeys[index] !== undefined ? visibleKeys[index] : null;
  },

  get length(): number {
    if (typeof window === "undefined") return 0;
    const username = getActiveUser();
    const prefix = username ? `user_${username}_` : "";
    let count = 0;
    const originalKey = (Storage.prototype as any)._originalKey || Storage.prototype.key;
    
    for (let i = 0; ; i++) {
      const rawKey = originalKey.call(window.localStorage, i);
      if (rawKey === null) break;
      if (GLOBAL_KEYS.includes(rawKey)) {
        count++;
      } else if (prefix && rawKey.startsWith(prefix)) {
        count++;
      } else if (!username && !rawKey.startsWith("user_")) {
        count++;
      }
    }
    return count;
  }
};

// Also apply the prototype override so any raw localStorage accesses are automatically isolated
if (typeof window !== "undefined") {
  const proto = Storage.prototype as any;
  if (!proto._originalGetItem) {
    proto._originalGetItem = proto.getItem;
    proto._originalSetItem = proto.setItem;
    proto._originalRemoveItem = proto.removeItem;
    proto._originalClear = proto.clear;
    proto._originalKey = proto.key;

    proto.getItem = function (key: string) {
      if (this !== window.localStorage) {
        return proto._originalGetItem.call(this, key);
      }
      return proto._originalGetItem.call(this, getPartitionedKey(key));
    };

    proto.setItem = function (key: string, value: string) {
      if (this !== window.localStorage) {
        proto._originalSetItem.call(this, key, value);
        return;
      }
      proto._originalSetItem.call(this, getPartitionedKey(key), value);
    };

    proto.removeItem = function (key: string) {
      if (this !== window.localStorage) {
        proto._originalRemoveItem.call(this, key);
        return;
      }
      proto._originalRemoveItem.call(this, getPartitionedKey(key));
    };

    proto.clear = function () {
      if (this !== window.localStorage) {
        proto._originalClear.call(this);
        return;
      }
      const username = getActiveUser();
      if (!username) {
        proto._originalClear.call(this);
        return;
      }
      const prefix = `user_${username}_`;
      const keysToRemove: string[] = [];
      for (let i = 0; ; i++) {
        const rawKey = proto._originalKey.call(this, i);
        if (rawKey === null) break;
        if (rawKey.startsWith(prefix)) {
          keysToRemove.push(rawKey);
        }
      }
      keysToRemove.forEach(k => proto._originalRemoveItem.call(this, k));
    };

    Object.defineProperty(proto, "length", {
      configurable: true,
      enumerable: true,
      get: function () {
        if (this !== window.localStorage) {
          let count = 0;
          for (let i = 0; ; i++) {
            if (proto._originalKey.call(this, i) === null) break;
            count++;
          }
          return count;
        }
        
        const username = getActiveUser();
        const prefix = username ? `user_${username}_` : "";
        let count = 0;
        for (let i = 0; ; i++) {
          const rawKey = proto._originalKey.call(this, i);
          if (rawKey === null) break;
          if (GLOBAL_KEYS.includes(rawKey)) {
            count++;
          } else if (prefix && rawKey.startsWith(prefix)) {
            count++;
          } else if (!username && !rawKey.startsWith("user_")) {
            count++;
          }
        }
        return count;
      }
    });

    proto.key = function (index: number) {
      if (this !== window.localStorage) {
        return proto._originalKey.call(this, index);
      }
      const username = getActiveUser();
      const prefix = username ? `user_${username}_` : "";
      const visibleKeys: string[] = [];
      for (let i = 0; ; i++) {
        const rawKey = proto._originalKey.call(this, i);
        if (rawKey === null) break;
        if (GLOBAL_KEYS.includes(rawKey)) {
          visibleKeys.push(rawKey);
        } else if (prefix && rawKey.startsWith(prefix)) {
          visibleKeys.push(rawKey.substring(prefix.length));
        } else if (!username && !rawKey.startsWith("user_")) {
          visibleKeys.push(rawKey);
        }
      }
      return visibleKeys[index] !== undefined ? visibleKeys[index] : null;
    };
  }
}
