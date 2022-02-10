export interface InfluxOptions {
  url: string;
  db: string;
  username?: string;
  password?: string;
}

export interface Tags {
  [x: string]: string;
}

export interface Fields {
  [x: string]: number | boolean | string;
}

export interface Metrics {
  measurement: string;
  fields: Fields;
  tags?: Tags;
  timestamp?: number; 
}

export class DB {
  /**
   * writes data influx db
   */
  write(metrics: Metrics): Promise<any>;
  write(metrics: Metrics[]): Promise<any>;
}

/**
 * creates new influx db client instance
 */
export function db(options: InfluxOptions): DB;

/**
 * writes data to influx db
 */
export function write(options: InfluxOptions, metrics: Metrics): Promise<any>;
export function write(options: InfluxOptions, metrics: Metrics[]): Promise<any>;
export namespace influx { }