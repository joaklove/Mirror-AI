export interface EncryptionResult {
  encrypted: string;
  iv: string;
}

export interface EncryptedData {
  encrypted: string;
  iv: string;
  salt?: string;
}

export const encryptionService = {
  generateKey(password: string, salt?: string): Promise<CryptoKey> {
    const useSalt = salt || crypto.randomUUID();
    const encoder = new TextEncoder();
    const passwordKey = encoder.encode(password + useSalt);
    
    return crypto.subtle.importKey(
      'raw',
      passwordKey,
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    ).then((key) => 
      crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: encoder.encode(useSalt),
          iterations: 100000,
          hash: 'SHA-256',
        },
        key,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      )
    );
  },

  async encrypt(data: string, password: string): Promise<EncryptedData> {
    const encoder = new TextEncoder();
    const salt = crypto.randomUUID();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const key = await this.generateKey(password, salt);
    
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encoder.encode(data)
    );
    
    return {
      encrypted: this.arrayBufferToBase64(encrypted),
      iv: this.arrayBufferToBase64(iv),
      salt,
    };
  },

  async decrypt(encryptedData: EncryptedData, password: string): Promise<string> {
    const decoder = new TextDecoder();
    const key = await this.generateKey(password, encryptedData.salt);
    
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: this.base64ToArrayBuffer(encryptedData.iv),
      },
      key,
      this.base64ToArrayBuffer(encryptedData.encrypted)
    );
    
    return decoder.decode(decrypted);
  },

  generateRandomKey(): Promise<CryptoKey> {
    return crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  },

  async exportKey(key: CryptoKey): Promise<string> {
    const exported = await crypto.subtle.exportKey('raw', key);
    return this.arrayBufferToBase64(exported);
  },

  async importKey(keyString: string): Promise<CryptoKey> {
    const keyData = this.base64ToArrayBuffer(keyString);
    return crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  },

  encryptWithKey(data: string, key: CryptoKey): Promise<EncryptionResult> {
    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    return crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encoder.encode(data)
    ).then(encrypted => ({
      encrypted: this.arrayBufferToBase64(encrypted),
      iv: this.arrayBufferToBase64(iv),
    }));
  },

  decryptWithKey(encryptedData: EncryptionResult, key: CryptoKey): Promise<string> {
    const decoder = new TextDecoder();
    
    return crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: this.base64ToArrayBuffer(encryptedData.iv),
      },
      key,
      this.base64ToArrayBuffer(encryptedData.encrypted)
    ).then(decrypted => decoder.decode(decrypted));
  },

  arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    let binary = '';
    bytes.forEach(byte => binary += String.fromCharCode(byte));
    return btoa(binary);
  },

  base64ToArrayBuffer(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  },

  hashData(data: string): Promise<string> {
    const encoder = new TextEncoder();
    return crypto.subtle.digest('SHA-256', encoder.encode(data))
      .then(hash => this.arrayBufferToBase64(hash));
  },
};

export class LocalEncryption {
  private key: CryptoKey | null = null;
  private keyString: string | null = null;

  async initialize(password: string): Promise<void> {
    const salt = localStorage.getItem('encryption_salt');
    if (salt) {
      this.key = await encryptionService.generateKey(password, salt);
    } else {
      this.key = await encryptionService.generateKey(password);
      const salt = crypto.randomUUID();
      localStorage.setItem('encryption_salt', salt);
    }
    this.keyString = await encryptionService.exportKey(this.key);
  }

  async encrypt(data: object): Promise<string> {
    if (!this.key) throw new Error('Encryption not initialized');
    
    const jsonString = JSON.stringify(data);
    const result = await encryptionService.encryptWithKey(jsonString, this.key);
    return JSON.stringify(result);
  }

  async decrypt<T>(encryptedString: string): Promise<T> {
    if (!this.key) throw new Error('Encryption not initialized');
    
    const result = JSON.parse(encryptedString) as EncryptionResult;
    const jsonString = await encryptionService.decryptWithKey(result, this.key);
    return JSON.parse(jsonString) as T;
  }

  isInitialized(): boolean {
    return this.key !== null;
  }
}
