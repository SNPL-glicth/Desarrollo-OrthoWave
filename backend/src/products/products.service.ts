import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductReservation, ReservationStatus } from './entities/product-reservation.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateReservationDto, UpdateReservationStatusDto, ReserveProductsDto } from './dto/create-reservation.dto';
import { Paciente } from '../pacientes/entities/paciente.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductReservation)
    private reservationRepository: Repository<ProductReservation>,
    @InjectRepository(Paciente)
    private pacienteRepository: Repository<Paciente>,
  ) {}

  // HELPER METHODS
  private async getPatientByUserId(userId: number): Promise<Paciente> {
    const paciente = await this.pacienteRepository.findOne({
      where: { usuarioId: userId }
    });

    if (!paciente) {
      throw new NotFoundException('Paciente no encontrado para este usuario');
    }

    return paciente;
  }

  // PRODUCTOS
  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return await this.productRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    return await this.productRepository.find({
      where: { is_available: true },
      order: { name: 'ASC' }
    });
  }

  async findByCategory(category: string): Promise<Product[]> {
    return await this.productRepository.find({
      where: { category, is_available: true },
      order: { name: 'ASC' }
    });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id }
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    return product;
  }

  async update(id: number, updateData: Partial<CreateProductDto>): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, updateData);
    return await this.productRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    product.is_available = false;
    await this.productRepository.save(product);
  }

  // RESERVAS DE PRODUCTOS
  async reserveProducts(userId: number, reserveDto: ReserveProductsDto): Promise<ProductReservation[]> {
    const paciente = await this.getPatientByUserId(userId);
    const reservations: ProductReservation[] = [];

    for (const productId of reserveDto.product_ids) {
      const product = await this.findOne(productId);
      const quantity = reserveDto.quantities[productId] || 1;

      if (product.stock < quantity) {
        throw new BadRequestException(`Stock insuficiente para ${product.name}. Stock disponible: ${product.stock}`);
      }

      const totalPrice = product.price * quantity;

      const reservation = this.reservationRepository.create({
        patient_id: paciente.id,
        product_id: productId,
        quantity,
        unit_price: product.price,
        total_price: totalPrice,
        notes: reserveDto.notes,
        status: ReservationStatus.PENDING
      });

      const savedReservation = await this.reservationRepository.save(reservation);
      reservations.push(savedReservation);

      // Reducir stock temporalmente
      product.stock -= quantity;
      await this.productRepository.save(product);
    }

    return reservations;
  }

  async getPatientReservations(userId: number): Promise<ProductReservation[]> {
    const paciente = await this.getPatientByUserId(userId);
    return await this.reservationRepository.find({
      where: { patient_id: paciente.id },
      order: { created_at: 'DESC' },
      relations: ['product']
    });
  }

  async updateReservationStatus(
    reservationId: number, 
    doctorId: number, 
    updateDto: UpdateReservationStatusDto
  ): Promise<ProductReservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId },
      relations: ['product']
    });

    if (!reservation) {
      throw new NotFoundException('Reserva no encontrada');
    }

    reservation.status = updateDto.status;
    reservation.doctor_notes = updateDto.doctor_notes;
    reservation.confirmed_by_doctor_id = doctorId;

    if (updateDto.status === ReservationStatus.CONFIRMED) {
      reservation.confirmed_at = new Date();
    }

    if (updateDto.status === ReservationStatus.DELIVERED) {
      reservation.delivered_at = new Date();
    }

    // Si se cancela la reserva, devolver el stock
    if (updateDto.status === ReservationStatus.CANCELLED) {
      const product = reservation.product;
      product.stock += reservation.quantity;
      await this.productRepository.save(product);
    }

    return await this.reservationRepository.save(reservation);
  }

  async getPendingReservations(): Promise<ProductReservation[]> {
    return await this.reservationRepository.find({
      where: { status: ReservationStatus.PENDING },
      order: { created_at: 'DESC' },
      relations: ['product', 'patient']
    });
  }

  async getReservationsByPatient(patientId: number): Promise<ProductReservation[]> {
    return await this.reservationRepository.find({
      where: { patient_id: patientId },
      order: { created_at: 'DESC' },
      relations: ['product']
    });
  }

  async getReservationSummaryByPatient(userId: number) {
    const reservations = await this.getPatientReservations(userId);
    
    const summary = {
      pending: reservations.filter(r => r.status === ReservationStatus.PENDING),
      confirmed: reservations.filter(r => r.status === ReservationStatus.CONFIRMED),
      delivered: reservations.filter(r => r.status === ReservationStatus.DELIVERED),
      cancelled: reservations.filter(r => r.status === ReservationStatus.CANCELLED),
      totalPending: reservations
        .filter(r => r.status === ReservationStatus.PENDING)
        .reduce((sum, r) => sum + Number(r.total_price), 0),
      totalConfirmed: reservations
        .filter(r => r.status === ReservationStatus.CONFIRMED)
        .reduce((sum, r) => sum + Number(r.total_price), 0)
    };

    return summary;
  }
}
