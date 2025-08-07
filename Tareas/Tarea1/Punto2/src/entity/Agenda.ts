import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";
@Entity('agenda')
export class Agenda {
 @PrimaryGeneratedColumn()
 id: number;
 @Column({ length: 100 })
 nombres: string;
 @Column({ length: 100 })
 apellidos: string;  
 @Column({ type: 'date' })
 fecha_nacimiento: Date; 
 @Column({ length: 255, nullable: true })
 direccion: string;  
 @Column({ length: 20, nullable: true })
 celular: string;    
 @Column({ length: 100, nullable: true })
 correo: string;
}