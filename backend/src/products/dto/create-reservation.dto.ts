import { IsNumber, IsOptional, IsString, IsEnum, IsPositive } from 'class-validator';
import { ReservationStatus } from '../entities/product-reservation.entity';

export class CreateReservationDto {
  @IsNumber()
  product_id: number;

  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateReservationStatusDto {
  @IsEnum(ReservationStatus)
  status: ReservationStatus;

  @IsOptional()
  @IsString()
  doctor_notes?: string;
}

export class ReserveProductsDto {
  @IsNumber({}, { each: true })
  product_ids: number[];

  quantities: { [productId: number]: number };

  @IsOptional()
  @IsString()
  notes?: string;
}
