
/*class Storage {
  static isLocalStorageSupported(): boolean {
    const storage = window.localStorage;
    const testKey = 'testLocalStorageFunctionality';
    let supported = true;

    try {
      storage.setItem(testKey, testKey);
      storage.removeItem(testKey);
    } catch (error) {
      supported = false;
    }

    return !!supported;
  }

  static get(key: string): unknown {
    let value: string;
    if (Storage.isLocalStorageSupported()) {
      value = window.localStorage.getItem(key);
    } else {
      value = Cookies.get(key);
    }

    if (value) {
      value = JSON.parse(value);
    }

    return value;
  }

  static set(key: string, data: unknown): void {
    const value = JSON.stringify(data);

    if (Storage.isLocalStorageSupported()) {
      window.localStorage.setItem(key, value);
    } else {
      Cookies.set(key, value);
    }
  }

  static remove(key: string): void {
    if (Storage.isLocalStorageSupported()) {
      window.localStorage.removeItem(key);
    } else {
      Cookies.remove(key);
    }
  }
}

export default Storage;*/


/*export default class Storage {
  static get(key: string): string | null {
    try {
      const value = localStorage.getItem(key);
      if (value !== null) return value;
    } catch {}

    // fallback to cookies
    const match = document.cookie.match(
      new RegExp(`(?:^|; )${encodeURIComponent(key)}=([^;]*)`)
    );
    return match ? decodeURIComponent(match[1]) : null;
  }

  static set(key: string, value: string, options: { expiresDays?: number } = {}): void {
    try {
      localStorage.setItem(key, value);
      return;
    } catch {}

    // fallback to cookies
    let cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    if (options.expiresDays) {
      const date = new Date();
      date.setTime(date.getTime() + options.expiresDays * 24 * 60 * 60 * 1000);
      cookie += `; expires=${date.toUTCString()}`;
    }
    cookie += `; path=/`;
    document.cookie = cookie;
  }

  static remove(key: string): void {
    try {
      localStorage.removeItem(key);
      return;
    } catch {}

    // remove cookie by setting expired
    document.cookie = `${encodeURIComponent(key)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }
}*/

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

export default class Storage {
  static get(key: string): string | null {
    if (!isBrowser) return null;

    try {
      const value = window.localStorage.getItem(key);
      if (value !== null) return value;
    } catch {}

    // fallback to cookies
    const match = document.cookie.match(
      new RegExp(`(?:^|; )${encodeURIComponent(key)}=([^;]*)`)
    );

    return match ? decodeURIComponent(match[1]) : null;
  }

  static set(
    key: string,
    value: string,
    options: { expiresDays?: number } = {}
  ): void {
    if (!isBrowser) return;

    try {
      window.localStorage.setItem(key, value);
      return;
    } catch {}

    // fallback to cookies
    let cookie = `${encodeURIComponent(key)}=${encodeURIComponent(
      value
    )}`;
    if (options.expiresDays) {
      const date = new Date();
      date.setTime(
        date.getTime() + options.expiresDays * 24 * 60 * 60 * 1000
      );
      cookie += `; expires=${date.toUTCString()}`;
    }
    cookie += `; path=/`;
    document.cookie = cookie;
  }

  static remove(key: string): void {
    if (!isBrowser) return;
    try {
      window.localStorage.removeItem(key);
      return;
    } catch {}

    // remove cookie by setting expired
    document.cookie = `${encodeURIComponent(key)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }
}
