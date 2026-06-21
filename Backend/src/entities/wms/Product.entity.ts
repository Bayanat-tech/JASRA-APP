import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import constants from "../../helpers/constants";

@Entity(constants.TABLE.MS_PRODUCT)
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  prin_code: string;

  @Column({ type: 'int', nullable: true })
  uom_count: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Add other columns as per your database schema
}
