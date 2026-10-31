// =====================================================================
// PURE NODE.JS ZERO-DEPENDENCY ZIP GENERATOR & SAFE EXTRACTOR
// Compliant with PKWARE ZIP standard (DEFLATE / STORE)
// Includes strict security audits against path traversal and zip bombs
// =====================================================================

import zlib from 'zlib';

export interface ZipFileInput {
  path: string;
  content: string | Buffer;
}

export interface ZipEntry {
  path: string;
  buffer: Buffer;
  text(): string;
  json<T = any>(): T;
}

const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  CRC_TABLE[i] = c >>> 0;
}

export function calculateCrc32(buf: Buffer): number {
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buf[i]) & 0xFF];
  }
  return ((crc ^ (-1)) >>> 0);
}

/**
 * Creates a standard binary ZIP buffer containing the provided files
 */
export function createZipArchive(files: ZipFileInput[]): Buffer {
  const localHeaders: Buffer[] = [];
  const centralHeaders: Buffer[] = [];
  let offset = 0;

  for (const file of files) {
    const cleanPath = file.path.replace(/^\/+/, '').replace(/\\+/g, '/');
    const nameBuf = Buffer.from(cleanPath, 'utf8');
    const dataBuf = Buffer.isBuffer(file.content)
      ? file.content
      : Buffer.from(file.content, 'utf8');

    const compressed = zlib.deflateRawSync(dataBuf);
    const crc = calculateCrc32(dataBuf);

    // Local Header (30 bytes + name)
    const localHeader = Buffer.alloc(30 + nameBuf.length);
    localHeader.writeUInt32LE(0x04034b50, 0); // Local header signature
    localHeader.writeUInt16LE(20, 4);         // Version needed (2.0)
    localHeader.writeUInt16LE(0, 6);          // General purpose bit flag
    localHeader.writeUInt16LE(8, 8);          // Compression method: 8 (DEFLATE)
    localHeader.writeUInt16LE(0, 10);         // Last mod file time
    localHeader.writeUInt16LE(0, 12);         // Last mod file date
    localHeader.writeUInt32LE(crc, 14);       // CRC-32
    localHeader.writeUInt32LE(compressed.length, 18); // Compressed size
    localHeader.writeUInt32LE(dataBuf.length, 22);    // Uncompressed size
    localHeader.writeUInt16LE(nameBuf.length, 26);    // Filename length
    localHeader.writeUInt16LE(0, 28);                 // Extra field length
    nameBuf.copy(localHeader, 30);

    localHeaders.push(localHeader, compressed);

    // Central Directory Header (46 bytes + name)
    const centralHeader = Buffer.alloc(46 + nameBuf.length);
    centralHeader.writeUInt32LE(0x02014b50, 0); // Central directory signature
    centralHeader.writeUInt16LE(20, 4);          // Version made by
    centralHeader.writeUInt16LE(20, 6);          // Version needed
    centralHeader.writeUInt16LE(0, 8);           // Bit flags
    centralHeader.writeUInt16LE(8, 10);          // Compression method: 8
    centralHeader.writeUInt16LE(0, 12);          // Mod time
    centralHeader.writeUInt16LE(0, 14);          // Mod date
    centralHeader.writeUInt32LE(crc, 16);        // CRC-32
    centralHeader.writeUInt32LE(compressed.length, 20); // Compressed size
    centralHeader.writeUInt32LE(dataBuf.length, 24);    // Uncompressed size
    centralHeader.writeUInt16LE(nameBuf.length, 28);    // Name length
    centralHeader.writeUInt16LE(0, 30);                 // Extra length
    centralHeader.writeUInt16LE(0, 32);                 // Comment length
    centralHeader.writeUInt16LE(0, 34);                 // Disk number start
    centralHeader.writeUInt16LE(0, 36);                 // Internal attrs
    centralHeader.writeUInt32LE(0, 38);                 // External attrs
    centralHeader.writeUInt32LE(offset, 42);            // Relative offset of local header
    nameBuf.copy(centralHeader, 46);

    centralHeaders.push(centralHeader);
    offset += localHeader.length + compressed.length;
  }

  const centralDirOffset = offset;
  let centralDirSize = 0;
  for (const ch of centralHeaders) {
    centralDirSize += ch.length;
  }

  // End of Central Directory Record (22 bytes)
  const endRecord = Buffer.alloc(22);
  endRecord.writeUInt32LE(0x06054b50, 0);       // Signature
  endRecord.writeUInt16LE(0, 4);                // Disk number
  endRecord.writeUInt16LE(0, 6);                // Start disk
  endRecord.writeUInt16LE(files.length, 8);     // Total entries this disk
  endRecord.writeUInt16LE(files.length, 10);    // Total entries
  endRecord.writeUInt32LE(centralDirSize, 12);  // Size of central directory
  endRecord.writeUInt32LE(centralDirOffset, 16);// Offset of central directory
  endRecord.writeUInt16LE(0, 20);               // Comment length

  return Buffer.concat([...localHeaders, ...centralHeaders, endRecord]);
}

/**
 * Safely extracts entries from a ZIP archive buffer.
 * Performs rigorous security checks to prevent path traversal (e.g. "../") and zip bombs.
 */
export function extractZipArchive(
  zipBuffer: Buffer,
  options: { maxTotalBytes?: number } = {}
): Record<string, ZipEntry> {
  const maxBytes = options.maxTotalBytes || 100 * 1024 * 1024; // 100 MB safe limit
  let cumulativeBytes = 0;

  // 1. Locate End of Central Directory (0x06054b50)
  let eocdOffset = -1;
  for (let i = zipBuffer.length - 22; i >= 0; i--) {
    if (zipBuffer.readUInt32LE(i) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }

  if (eocdOffset === -1) {
    throw new Error('Invalid PaperTrail archive: End of Central Directory record not found.');
  }

  const totalEntries = zipBuffer.readUInt16LE(eocdOffset + 10);
  const cdOffset = zipBuffer.readUInt32LE(eocdOffset + 16);

  const results: Record<string, ZipEntry> = {};
  let cur = cdOffset;

  for (let e = 0; e < totalEntries; e++) {
    if (cur + 46 > zipBuffer.length || zipBuffer.readUInt32LE(cur) !== 0x02014b50) {
      throw new Error(`Corrupted archive: central directory header mismatch at entry ${e}`);
    }

    const method = zipBuffer.readUInt16LE(cur + 10);
    const compSize = zipBuffer.readUInt32LE(cur + 20);
    const uncompSize = zipBuffer.readUInt32LE(cur + 24);
    const nameLen = zipBuffer.readUInt16LE(cur + 28);
    const extraLen = zipBuffer.readUInt16LE(cur + 30);
    const commentLen = zipBuffer.readUInt16LE(cur + 32);
    const localHeaderOffset = zipBuffer.readUInt32LE(cur + 42);

    const rawPath = zipBuffer.toString('utf8', cur + 46, cur + 46 + nameLen);
    cur += 46 + nameLen + extraLen + commentLen;

    // Security Verification: Path Traversal prevention
    if (
      rawPath.includes('..') ||
      rawPath.startsWith('/') ||
      rawPath.startsWith('\\') ||
      /^[a-zA-Z]:/.test(rawPath)
    ) {
      throw new Error(`Security Violation: Disallowed path traversal in archive entry: "${rawPath}"`);
    }

    // Skip directory entries
    if (rawPath.endsWith('/')) {
      continue;
    }

    // Zip bomb defense
    cumulativeBytes += uncompSize;
    if (cumulativeBytes > maxBytes) {
      throw new Error(`Archive exceeds maximum allowable uncompressed size limit (${maxBytes} bytes).`);
    }

    // Read Local Header
    if (
      localHeaderOffset + 30 > zipBuffer.length ||
      zipBuffer.readUInt32LE(localHeaderOffset) !== 0x04034b50
    ) {
      throw new Error(`Invalid local header for entry: ${rawPath}`);
    }

    const lhNameLen = zipBuffer.readUInt16LE(localHeaderOffset + 26);
    const lhExtraLen = zipBuffer.readUInt16LE(localHeaderOffset + 28);
    const dataOffset = localHeaderOffset + 30 + lhNameLen + lhExtraLen;

    if (dataOffset + compSize > zipBuffer.length) {
      throw new Error(`Data offset out of bounds for entry: ${rawPath}`);
    }

    const rawData = zipBuffer.subarray(dataOffset, dataOffset + compSize);
    let extractedBuffer: Buffer;

    if (method === 0) {
      extractedBuffer = Buffer.from(rawData);
    } else if (method === 8) {
      extractedBuffer = zlib.inflateRawSync(rawData);
    } else {
      throw new Error(`Unsupported compression method (${method}) in entry: ${rawPath}`);
    }

    // Normalize path by stripping top-level directory if standard prefix was used
    const normalizedKey = rawPath.replace(/^papertrail-research\//, '');

    results[normalizedKey] = {
      path: normalizedKey,
      buffer: extractedBuffer,
      text() {
        return this.buffer.toString('utf8');
      },
      json<T>() {
        return JSON.parse(this.text()) as T;
      }
    };
  }

  return results;
}

