export interface InfluxOptions {
  url: string;
  version?: string;
  db?: string;
  org?: string;
  bucket?: string;
  precision?: string;
  username?: string;
  password?: string;
  token?: string;
}

export interface Tags {
  [x: string]: string;
}

export interface Fields {
  [x: string]: number | boolean | string;
}

export interface Metric {
  measurement: string;
  fields: Fields;
  tags?: Tags;
  timestamp?: number; 
}

export class DB {
  /**
   * writes data influx db
   */
  write(metrics: Metric): Promise<any>;
  write(metrics: Metric[]): Promise<any>;

  /**
   * queries data from influx db
   */
  query(value: String): Promise<any>;
  flux(value: String): Promise<any>;
}

/**
 * creates new influx db client instance
 */
export function db(options: InfluxOptions): DB;

/**
 * writes data to influx db
 */
export function write(options: InfluxOptions, metrics: Metric): Promise<any>;
export function write(options: InfluxOptions, metrics: Metric[]): Promise<any>;

/**
 * queries data from influx db
 */
export function query(options: InfluxOptions, value: String): Promise<any>;
export function flux(options: InfluxOptions, value: String): Promise<any>;

export namespace influx { }