export interface InfluxOptions {
  url: string;
  db: string;
}

export interface Tags {
  [x: string]: string;
}

export interface Fields {
  [x: string]: number | boolean | string;
}

export interface WriteData {
  measurement: string;
  fields: Fields;
  tags?: Tags;
  timestamp?: number; 
}

export class DB {
  /**
   * writes data influx db
   */
  write(data: WriteData[]): Promise<any>;
}

/**
 * creates new influx db client instance
 */
export function db(options: InfluxOptions): DB;

/**
 * writes data to influx db
 */
export function write(options: InfluxOptions, data: WriteData[]): Promise<any>;
export namespace influx { }