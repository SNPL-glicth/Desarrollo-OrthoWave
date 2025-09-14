import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateReservationStatusDto, ReserveProductsDto } from './dto/create-reservation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ENDPOINTS PÚBLICOS (para mostrar productos)
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get('category/:category')
  findByCategory(@Param('category') category: string) {
    return this.productsService.findByCategory(category);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  // ENDPOINTS PROTEGIDOS PARA ADMINISTRADORES
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: Partial<CreateProductDto>) {
    return this.productsService.update(+id, updateProductDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }

  // ENDPOINTS DE RESERVAS PARA PACIENTES
  @UseGuards(JwtAuthGuard)
  @Post('reserve')
  async reserveProducts(@Request() req, @Body() reserveDto: ReserveProductsDto) {
    return this.productsService.reserveProducts(req.user.id, reserveDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('reservations/my')
  async getMyReservations(@Request() req) {
    return this.productsService.getPatientReservations(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('reservations/summary/my')
  async getMyReservationSummary(@Request() req) {
    return this.productsService.getReservationSummaryByPatient(req.user.id);
  }

  // ENDPOINTS PARA DOCTORES/ADMINISTRADORES
  @UseGuards(JwtAuthGuard)
  @Get('reservations/pending')
  async getPendingReservations() {
    return this.productsService.getPendingReservations();
  }

  @UseGuards(JwtAuthGuard)
  @Get('reservations/patient/:patientId')
  async getPatientReservations(@Param('patientId') patientId: string) {
    return this.productsService.getReservationsByPatient(+patientId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('reservations/patient/:patientId/summary')
  async getPatientReservationSummary(@Param('patientId') patientId: string) {
    return this.productsService.getReservationSummaryByPatient(+patientId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('reservations/:id/status')
  async updateReservationStatus(
    @Param('id') id: string,
    @Request() req,
    @Body() updateDto: UpdateReservationStatusDto
  ) {
    return this.productsService.updateReservationStatus(+id, req.user.id, updateDto);
  }
}
