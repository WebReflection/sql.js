import { decode } from 'buffer-to-base64/decode';

import sqlite from './base64/sqlite.js';
import initSqlJs from './sql.js';

export default async moduleConfig => {
  const url = URL.createObjectURL(
    new Blob([await decode(sqlite)], { type: 'application/wasm' })
  );
  const SQL = await initSqlJs({ ...moduleConfig, locateFile: () => url });
  URL.revokeObjectURL(url);
  return SQL;
};
